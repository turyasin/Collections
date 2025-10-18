"""
Migration script to add currency field to invoices and payments
Sets default value to "TRY" for all existing records
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def migrate_currency():
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("Starting migration to add currency field...")
    print("=" * 60)
    
    # Update all invoices without currency
    invoices_result = await db.invoices.update_many(
        {"currency": {"$exists": False}},
        {"$set": {"currency": "TRY"}}
    )
    print(f"✅ Updated {invoices_result.modified_count} invoices with currency='TRY'")
    
    # Update all payments without currency
    payments_result = await db.payments.update_many(
        {"currency": {"$exists": False}},
        {"$set": {"currency": "TRY"}}
    )
    print(f"✅ Updated {payments_result.modified_count} payments with currency='TRY'")
    
    print("=" * 60)
    print("✅ Migration completed successfully!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(migrate_currency())
