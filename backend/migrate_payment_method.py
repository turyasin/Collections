"""
Migration script to add payment_method field to existing payments
Sets default value to "Çek" for all existing records
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def migrate_payment_method():
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("Starting migration to add payment_method field...")
    print("=" * 60)
    
    # Update all payments without payment_method
    payments_result = await db.payments.update_many(
        {"payment_method": {"$exists": False}},
        {"$set": {"payment_method": "Çek"}}
    )
    print(f"✅ Updated {payments_result.modified_count} payments with payment_method='Çek'")
    
    print("=" * 60)
    print("✅ Migration completed successfully!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(migrate_payment_method())
