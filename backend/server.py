from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import pytz

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
security = HTTPBearer()

# Email configuration
SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY', '')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'turyasin@gmail.com')

# Scheduler
scheduler = AsyncIOScheduler(timezone=pytz.timezone('Europe/Istanbul'))

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: EmailStr
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Customer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CustomerCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class Invoice(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    customer_name: Optional[str] = None
    invoice_number: str
    amount: float
    paid_amount: float = 0.0
    due_date: str
    status: str = "unpaid"
    notes: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class InvoiceCreate(BaseModel):
    customer_id: str
    invoice_number: str
    amount: float
    due_date: str
    notes: Optional[str] = None

class InvoiceUpdate(BaseModel):
    customer_id: Optional[str] = None
    invoice_number: Optional[str] = None
    amount: Optional[float] = None
    due_date: Optional[str] = None
    notes: Optional[str] = None

class Payment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    invoice_id: str
    invoice_number: Optional[str] = None
    customer_name: Optional[str] = None
    check_number: str
    check_date: str
    bank_name: str
    amount: float
    payment_date: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class PaymentCreate(BaseModel):
    invoice_id: str
    check_number: str
    check_date: str
    bank_name: str
    amount: float

class DashboardStats(BaseModel):
    total_invoices: int
    total_amount: float
    paid_amount: float
    outstanding_amount: float
    unpaid_count: int
    partial_count: int
    paid_count: int
    recent_payments: List[Payment]

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Email notification functions
async def send_invoice_reminder_email(invoice_number: str, customer_name: str, amount: float, due_date: str):
    """Send email reminder for upcoming invoice due date"""
    if not SENDGRID_API_KEY or SENDGRID_API_KEY == 'your-sendgrid-api-key-here':
        logger.warning(f"SendGrid API key not configured. Skipping email for invoice {invoice_number}")
        return False
    
    try:
        message = Mail(
            from_email='noreply@invoicetracker.com',
            to_emails=ADMIN_EMAIL,
            subject=f'Invoice Reminder: {invoice_number} - Due in 2 Days',
            html_content=f'''
            <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #2563eb;">Invoice Payment Reminder</h2>
                <p>This is a reminder that the following invoice is due in 2 days:</p>
                <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Invoice Number:</strong> {invoice_number}</p>
                    <p><strong>Customer:</strong> {customer_name}</p>
                    <p><strong>Amount:</strong> ₺{amount:.2f}</p>
                    <p><strong>Due Date:</strong> {due_date}</p>
                </div>
                <p style="color: #dc2626;">Please ensure payment collection is scheduled.</p>
                <hr style="margin: 20px 0;">
                <p style="color: #64748b; font-size: 12px;">This is an automated reminder from Invoice Tracker</p>
            </body>
            </html>
            '''
        )
        
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        logger.info(f"Email sent successfully for invoice {invoice_number}. Status: {response.status_code}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email for invoice {invoice_number}: {str(e)}")
        return False

async def check_upcoming_invoices():
    """Check for invoices due in 2 days and send reminders"""
    try:
        logger.info("Running daily invoice reminder check...")
        
        # Calculate date 2 days from now
        target_date = (datetime.now(timezone.utc) + timedelta(days=2)).date()
        target_date_str = target_date.isoformat()
        
        # Find unpaid and partial invoices due on target date
        invoices = await db.invoices.find({
            "status": {"$in": ["unpaid", "partial"]},
            "due_date": target_date_str
        }, {"_id": 0}).to_list(1000)
        
        if not invoices:
            logger.info(f"No invoices due on {target_date_str}")
            return
        
        logger.info(f"Found {len(invoices)} invoices due on {target_date_str}")
        
        # Send email for each invoice
        for invoice in invoices:
            # Get customer name
            customer = await db.customers.find_one({"id": invoice["customer_id"]}, {"_id": 0})
            customer_name = customer["name"] if customer else "Unknown Customer"
            
            await send_invoice_reminder_email(
                invoice_number=invoice["invoice_number"],
                customer_name=customer_name,
                amount=invoice["amount"],
                due_date=invoice["due_date"]
            )
        
        logger.info("Daily invoice reminder check completed")
    except Exception as e:
        logger.error(f"Error in check_upcoming_invoices: {str(e)}")

# Auth routes
@api_router.post("/auth/register", response_model=dict)
async def register(user: UserCreate):
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user.model_dump()
    user_dict["password"] = hash_password(user_dict["password"])
    user_obj = User(**{k: v for k, v in user_dict.items() if k != "password"})
    
    doc = user_obj.model_dump()
    doc["password"] = user_dict["password"]
    await db.users.insert_one(doc)
    
    token = create_access_token({"sub": user_obj.id})
    return {"token": token, "user": user_obj.model_dump()}

@api_router.post("/auth/login", response_model=dict)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user["id"]})
    user_data = User(**user).model_dump()
    return {"token": token, "user": user_data}

# Customer routes
@api_router.get("/customers", response_model=List[Customer])
async def get_customers(user_id: str = Depends(get_current_user)):
    customers = await db.customers.find({}, {"_id": 0}).to_list(1000)
    return customers

@api_router.post("/customers", response_model=Customer)
async def create_customer(customer: CustomerCreate, user_id: str = Depends(get_current_user)):
    customer_obj = Customer(**customer.model_dump())
    await db.customers.insert_one(customer_obj.model_dump())
    return customer_obj

@api_router.get("/customers/{customer_id}", response_model=Customer)
async def get_customer(customer_id: str, user_id: str = Depends(get_current_user)):
    customer = await db.customers.find_one({"id": customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@api_router.put("/customers/{customer_id}", response_model=Customer)
async def update_customer(customer_id: str, customer: CustomerCreate, user_id: str = Depends(get_current_user)):
    result = await db.customers.find_one({"id": customer_id}, {"_id": 0})
    if not result:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    await db.customers.update_one({"id": customer_id}, {"$set": customer.model_dump(exclude_unset=True)})
    updated = await db.customers.find_one({"id": customer_id}, {"_id": 0})
    return updated

@api_router.delete("/customers/{customer_id}")
async def delete_customer(customer_id: str, user_id: str = Depends(get_current_user)):
    result = await db.customers.delete_one({"id": customer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Customer deleted"}

# Invoice routes
@api_router.get("/invoices", response_model=List[Invoice])
async def get_invoices(status: Optional[str] = None, user_id: str = Depends(get_current_user)):
    query = {}
    if status:
        query["status"] = status
    
    invoices = await db.invoices.find(query, {"_id": 0}).to_list(1000)
    
    for invoice in invoices:
        customer = await db.customers.find_one({"id": invoice["customer_id"]}, {"_id": 0})
        if customer:
            invoice["customer_name"] = customer["name"]
    
    return invoices

@api_router.post("/invoices", response_model=Invoice)
async def create_invoice(invoice: InvoiceCreate, user_id: str = Depends(get_current_user)):
    existing = await db.invoices.find_one({"invoice_number": invoice.invoice_number})
    if existing:
        raise HTTPException(status_code=400, detail="Invoice number already exists")
    
    invoice_obj = Invoice(**invoice.model_dump())
    
    customer = await db.customers.find_one({"id": invoice.customer_id}, {"_id": 0})
    if customer:
        invoice_obj.customer_name = customer["name"]
    
    await db.invoices.insert_one(invoice_obj.model_dump())
    return invoice_obj

@api_router.get("/invoices/{invoice_id}", response_model=Invoice)
async def get_invoice(invoice_id: str, user_id: str = Depends(get_current_user)):
    invoice = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    customer = await db.customers.find_one({"id": invoice["customer_id"]}, {"_id": 0})
    if customer:
        invoice["customer_name"] = customer["name"]
    
    return invoice

@api_router.put("/invoices/{invoice_id}", response_model=Invoice)
async def update_invoice(invoice_id: str, invoice: InvoiceUpdate, user_id: str = Depends(get_current_user)):
    result = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
    if not result:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    update_data = invoice.model_dump(exclude_unset=True)
    await db.invoices.update_one({"id": invoice_id}, {"$set": update_data})
    
    updated = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
    
    customer = await db.customers.find_one({"id": updated["customer_id"]}, {"_id": 0})
    if customer:
        updated["customer_name"] = customer["name"]
    
    return updated

@api_router.delete("/invoices/{invoice_id}")
async def delete_invoice(invoice_id: str, user_id: str = Depends(get_current_user)):
    result = await db.invoices.delete_one({"id": invoice_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    await db.payments.delete_many({"invoice_id": invoice_id})
    return {"message": "Invoice deleted"}

# Payment routes
@api_router.get("/payments", response_model=List[Payment])
async def get_payments(user_id: str = Depends(get_current_user)):
    payments = await db.payments.find({}, {"_id": 0}).to_list(1000)
    
    for payment in payments:
        invoice = await db.invoices.find_one({"id": payment["invoice_id"]}, {"_id": 0})
        if invoice:
            payment["invoice_number"] = invoice["invoice_number"]
            customer = await db.customers.find_one({"id": invoice["customer_id"]}, {"_id": 0})
            if customer:
                payment["customer_name"] = customer["name"]
    
    return payments

@api_router.post("/payments", response_model=Payment)
async def create_payment(payment: PaymentCreate, user_id: str = Depends(get_current_user)):
    invoice = await db.invoices.find_one({"id": payment.invoice_id}, {"_id": 0})
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    payment_obj = Payment(**payment.model_dump())
    payment_obj.invoice_number = invoice["invoice_number"]
    
    customer = await db.customers.find_one({"id": invoice["customer_id"]}, {"_id": 0})
    if customer:
        payment_obj.customer_name = customer["name"]
    
    await db.payments.insert_one(payment_obj.model_dump())
    
    new_paid_amount = invoice.get("paid_amount", 0) + payment.amount
    invoice_amount = invoice["amount"]
    
    if new_paid_amount >= invoice_amount:
        new_status = "paid"
    elif new_paid_amount > 0:
        new_status = "partial"
    else:
        new_status = "unpaid"
    
    await db.invoices.update_one(
        {"id": payment.invoice_id},
        {"$set": {"paid_amount": new_paid_amount, "status": new_status}}
    )
    
    return payment_obj

@api_router.get("/payments/invoice/{invoice_id}", response_model=List[Payment])
async def get_invoice_payments(invoice_id: str, user_id: str = Depends(get_current_user)):
    payments = await db.payments.find({"invoice_id": invoice_id}, {"_id": 0}).to_list(1000)
    return payments

@api_router.delete("/payments/{payment_id}")
async def delete_payment(payment_id: str, user_id: str = Depends(get_current_user)):
    payment = await db.payments.find_one({"id": payment_id}, {"_id": 0})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    invoice = await db.invoices.find_one({"id": payment["invoice_id"]}, {"_id": 0})
    if invoice:
        new_paid_amount = max(0, invoice.get("paid_amount", 0) - payment["amount"])
        invoice_amount = invoice["amount"]
        
        if new_paid_amount >= invoice_amount:
            new_status = "paid"
        elif new_paid_amount > 0:
            new_status = "partial"
        else:
            new_status = "unpaid"
        
        await db.invoices.update_one(
            {"id": payment["invoice_id"]},
            {"$set": {"paid_amount": new_paid_amount, "status": new_status}}
        )
    
    await db.payments.delete_one({"id": payment_id})
    return {"message": "Payment deleted"}

# Dashboard route
@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(user_id: str = Depends(get_current_user)):
    invoices = await db.invoices.find({}, {"_id": 0}).to_list(1000)
    payments = await db.payments.find({}, {"_id": 0}).sort("created_at", -1).to_list(5)
    
    total_invoices = len(invoices)
    total_amount = sum(inv["amount"] for inv in invoices)
    paid_amount = sum(inv.get("paid_amount", 0) for inv in invoices)
    outstanding_amount = total_amount - paid_amount
    
    unpaid_count = len([inv for inv in invoices if inv["status"] == "unpaid"])
    partial_count = len([inv for inv in invoices if inv["status"] == "partial"])
    paid_count = len([inv for inv in invoices if inv["status"] == "paid"])
    
    for payment in payments:
        invoice = await db.invoices.find_one({"id": payment["invoice_id"]}, {"_id": 0})
        if invoice:
            payment["invoice_number"] = invoice["invoice_number"]
            customer = await db.customers.find_one({"id": invoice["customer_id"]}, {"_id": 0})
            if customer:
                payment["customer_name"] = customer["name"]
    
    return DashboardStats(
        total_invoices=total_invoices,
        total_amount=total_amount,
        paid_amount=paid_amount,
        outstanding_amount=outstanding_amount,
        unpaid_count=unpaid_count,
        partial_count=partial_count,
        paid_count=paid_count,
        recent_payments=payments
    )

# Email notification endpoint (for testing)
@api_router.post("/notifications/check-reminders")
async def trigger_reminder_check(user_id: str = Depends(get_current_user)):
    """Manually trigger invoice reminder check"""
    await check_upcoming_invoices()
    return {"message": "Invoice reminder check completed"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
