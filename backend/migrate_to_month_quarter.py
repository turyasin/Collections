"""
Migration script to convert period_type to month and quarter fields
Calculates month and quarter from invoice due_date and payment payment_date
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from pathlib import Path
from datetime import datetime

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

def get_month_year(date_str: str) -> str:
    """Convert date string to 'Month YYYY' format in Turkish"""
    try:
        date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        month_names = {
            1: "Ocak", 2: "Şubat", 3: "Mart", 4: "Nisan", 5: "Mayıs", 6: "Haziran",
            7: "Temmuz", 8: "Ağustos", 9: "Eylül", 10: "Ekim", 11: "Kasım", 12: "Aralık"
        }
        return f"{month_names[date_obj.month]} {date_obj.year}"
    except Exception as e:
        print(f"Error parsing date {date_str}: {e}")
        return "N/A"

def get_quarter_year(date_str: str) -> str:
    """Convert date string to 'QX YYYY' format"""
    try:
        date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        quarter = (date_obj.month - 1) // 3 + 1
        return f"Q{quarter} {date_obj.year}"
    except Exception as e:
        print(f"Error parsing date {date_str}: {e}")
        return "N/A"

async def migrate_to_month_quarter():
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("Starting migration to month/quarter system...")
    print("=" * 60)
    
    # Migrate invoices
    print("\n📄 Processing Invoices...")
    invoices = await db.invoices.find({}).to_list(length=None)
    invoice_count = 0
    for invoice in invoices:
        due_date = invoice.get("due_date")
        if due_date:
            month = get_month_year(due_date)
            quarter = get_quarter_year(due_date)
            
            # Remove old period_type and add new month/quarter fields
            await db.invoices.update_one(
                {"id": invoice["id"]},
                {
                    "$set": {"month": month, "quarter": quarter},
                    "$unset": {"period_type": ""}
                }
            )
            invoice_count += 1
            print(f"  ✓ Invoice {invoice.get('invoice_number')}: {due_date} → {month}, {quarter}")
    
    print(f"✅ Updated {invoice_count} invoices")
    
    # Migrate payments
    print("\n💰 Processing Payments...")
    payments = await db.payments.find({}).to_list(length=None)
    payment_count = 0
    for payment in payments:
        payment_date = payment.get("payment_date")
        if payment_date:
            month = get_month_year(payment_date)
            quarter = get_quarter_year(payment_date)
            
            # Remove old period_type and add new month/quarter fields
            await db.payments.update_one(
                {"id": payment["id"]},
                {
                    "$set": {"month": month, "quarter": quarter},
                    "$unset": {"period_type": ""}
                }
            )
            payment_count += 1
            print(f"  ✓ Payment {payment.get('check_number')}: {payment_date} → {month}, {quarter}")
    
    print(f"✅ Updated {payment_count} payments")
    
    print("\n" + "=" * 60)
    print("✅ Migration completed successfully!")
    print(f"   Total: {invoice_count} invoices + {payment_count} payments")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(migrate_to_month_quarter())
