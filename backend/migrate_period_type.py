"""
Migration script to add period_type field to existing invoices and payments
Sets default value to "Aylık" for all existing records
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def migrate_period_type():
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("Starting migration to add period_type field...")
    
    # Update all invoices without period_type
    invoices_result = await db.invoices.update_many(
        {"period_type": {"$exists": False}},
        {"$set": {"period_type": "Aylık"}}
    )
    print(f"Updated {invoices_result.modified_count} invoices")
    
    # Update all payments without period_type
    payments_result = await db.payments.update_many(
        {"period_type": {"$exists": False}},
        {"$set": {"period_type": "Aylık"}}
    )
    print(f"Updated {payments_result.modified_count} payments")
    
    print("Migration completed successfully!")
    client.close()

if __name__ == "__main__":
    asyncio.run(migrate_period_type())
