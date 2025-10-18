#!/usr/bin/env python3
"""
Quick test for weekly schedule export endpoints
"""

import requests
import sys
from datetime import datetime

def test_weekly_schedule_exports():
    base_url = "https://financeflow-100.preview.emergentagent.com"
    api_url = f"{base_url}/api"
    
    # First register/login to get a token
    test_email = f"test_{datetime.now().strftime('%H%M%S')}@example.com"
    user_data = {
        "username": f"testuser_{datetime.now().strftime('%H%M%S')}",
        "email": test_email,
        "password": "TestPassword123!"
    }
    
    # Register
    response = requests.post(f"{api_url}/auth/register", json=user_data)
    if response.status_code != 200:
        print(f"❌ Registration failed: {response.text}")
        return False
        
    token = response.json().get('token')
    if not token:
        print("❌ No token received")
        return False
        
    headers = {'Authorization': f'Bearer {token}'}
    
    # Test weekly schedule exports
    formats = ['xlsx', 'docx', 'pdf']
    for format_type in formats:
        print(f"Testing weekly schedule export - {format_type.upper()}...")
        response = requests.get(f"{api_url}/export/weekly-schedule?format={format_type}", headers=headers)
        
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            content_disposition = response.headers.get('content-disposition', '')
            content_length = len(response.content)
            
            print(f"✅ {format_type.upper()}: Success ({content_length} bytes)")
            print(f"   Content-Type: {content_type}")
            print(f"   Content-Disposition: {content_disposition}")
        else:
            print(f"❌ {format_type.upper()}: Failed - {response.status_code} - {response.text}")
            
    return True

if __name__ == "__main__":
    test_weekly_schedule_exports()