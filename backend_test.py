#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Invoice Tracker Application
Tests all authentication, customer, invoice, payment, and dashboard endpoints
"""

import requests
import sys
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

class InvoiceTrackerAPITester:
    def __init__(self, base_url="https://financeflow-100.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test data storage
        self.test_customer_id = None
        self.test_invoice_id = None
        self.test_payment_id = None

    def log_test(self, name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}: PASSED")
        else:
            print(f"❌ {name}: FAILED - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "response_data": response_data
        })

    def make_request(self, method: str, endpoint: str, data: Dict = None, expected_status: int = 200) -> tuple[bool, Dict]:
        """Make API request with error handling"""
        url = f"{self.api_url}/{endpoint.lstrip('/')}"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)
            else:
                return False, {"error": f"Unsupported method: {method}"}

            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"status_code": response.status_code, "text": response.text}

            return success, response_data

        except Exception as e:
            return False, {"error": str(e)}

    def test_user_registration(self):
        """Test user registration"""
        test_email = f"test_{datetime.now().strftime('%H%M%S')}@example.com"
        user_data = {
            "username": f"testuser_{datetime.now().strftime('%H%M%S')}",
            "email": test_email,
            "password": "TestPassword123!"
        }
        
        success, response = self.make_request('POST', '/auth/register', user_data, 200)
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response.get('user', {}).get('id')
            self.log_test("User Registration", True, f"User created with email: {test_email}")
            return True
        else:
            self.log_test("User Registration", False, f"Registration failed: {response}", response)
            return False

    def test_user_login(self):
        """Test user login with existing credentials"""
        if not self.token:
            self.log_test("User Login", False, "No token from registration to test login")
            return False
            
        # We'll test login by trying to access a protected endpoint
        success, response = self.make_request('GET', '/customers', expected_status=200)
        
        if success:
            self.log_test("User Login/Authentication", True, "Token authentication working")
            return True
        else:
            self.log_test("User Login/Authentication", False, f"Token authentication failed: {response}", response)
            return False

    def test_create_customer(self):
        """Test customer creation"""
        customer_data = {
            "name": "Test Customer Inc",
            "email": "customer@test.com",
            "phone": "555-0123",
            "address": "123 Test Street, Test City, TC 12345"
        }
        
        success, response = self.make_request('POST', '/customers', customer_data, 200)
        
        if success and 'id' in response:
            self.test_customer_id = response['id']
            self.log_test("Create Customer", True, f"Customer created with ID: {self.test_customer_id}")
            return True
        else:
            self.log_test("Create Customer", False, f"Customer creation failed: {response}", response)
            return False

    def test_get_customers(self):
        """Test getting all customers"""
        success, response = self.make_request('GET', '/customers', expected_status=200)
        
        if success and isinstance(response, list):
            customer_count = len(response)
            self.log_test("Get Customers", True, f"Retrieved {customer_count} customers")
            return True
        else:
            self.log_test("Get Customers", False, f"Failed to get customers: {response}", response)
            return False

    def test_update_customer(self):
        """Test customer update"""
        if not self.test_customer_id:
            self.log_test("Update Customer", False, "No customer ID available for update test")
            return False
            
        update_data = {
            "name": "Updated Test Customer Inc",
            "email": "updated@test.com",
            "phone": "555-9999"
        }
        
        success, response = self.make_request('PUT', f'/customers/{self.test_customer_id}', update_data, 200)
        
        if success and response.get('name') == update_data['name']:
            self.log_test("Update Customer", True, "Customer updated successfully")
            return True
        else:
            self.log_test("Update Customer", False, f"Customer update failed: {response}", response)
            return False

    def test_create_invoice(self):
        """Test invoice creation"""
        if not self.test_customer_id:
            self.log_test("Create Invoice", False, "No customer ID available for invoice creation")
            return False
            
        invoice_data = {
            "customer_id": self.test_customer_id,
            "invoice_number": f"INV-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "amount": 1500.00,
            "due_date": (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d'),
            "notes": "Test invoice for API testing"
        }
        
        success, response = self.make_request('POST', '/invoices', invoice_data, 200)
        
        if success and 'id' in response:
            self.test_invoice_id = response['id']
            self.log_test("Create Invoice", True, f"Invoice created with ID: {self.test_invoice_id}")
            return True
        else:
            self.log_test("Create Invoice", False, f"Invoice creation failed: {response}", response)
            return False

    def test_get_invoices(self):
        """Test getting all invoices"""
        success, response = self.make_request('GET', '/invoices', expected_status=200)
        
        if success and isinstance(response, list):
            invoice_count = len(response)
            self.log_test("Get Invoices", True, f"Retrieved {invoice_count} invoices")
            return True
        else:
            self.log_test("Get Invoices", False, f"Failed to get invoices: {response}", response)
            return False

    def test_invoice_status_filtering(self):
        """Test invoice status filtering"""
        success, response = self.make_request('GET', '/invoices?status=unpaid', expected_status=200)
        
        if success and isinstance(response, list):
            unpaid_count = len(response)
            self.log_test("Invoice Status Filter", True, f"Retrieved {unpaid_count} unpaid invoices")
            return True
        else:
            self.log_test("Invoice Status Filter", False, f"Failed to filter invoices: {response}", response)
            return False

    def test_create_payment(self):
        """Test payment creation and invoice status update"""
        if not self.test_invoice_id:
            self.log_test("Create Payment", False, "No invoice ID available for payment creation")
            return False
            
        payment_data = {
            "invoice_id": self.test_invoice_id,
            "check_number": f"CHK-{datetime.now().strftime('%H%M%S')}",
            "check_date": datetime.now().strftime('%Y-%m-%d'),
            "bank_name": "Test Bank",
            "amount": 750.00  # Partial payment
        }
        
        success, response = self.make_request('POST', '/payments', payment_data, 200)
        
        if success and 'id' in response:
            self.test_payment_id = response['id']
            self.log_test("Create Payment", True, f"Payment created with ID: {self.test_payment_id}")
            return True
        else:
            self.log_test("Create Payment", False, f"Payment creation failed: {response}", response)
            return False

    def test_invoice_status_update(self):
        """Test that invoice status updates after payment"""
        if not self.test_invoice_id:
            self.log_test("Invoice Status Update", False, "No invoice ID available for status check")
            return False
            
        success, response = self.make_request('GET', f'/invoices/{self.test_invoice_id}', expected_status=200)
        
        if success:
            status = response.get('status')
            paid_amount = response.get('paid_amount', 0)
            if status == 'partial' and paid_amount == 750.00:
                self.log_test("Invoice Status Update", True, f"Invoice status correctly updated to '{status}' with paid amount ${paid_amount}")
                return True
            else:
                self.log_test("Invoice Status Update", False, f"Invoice status not updated correctly. Status: {status}, Paid: ${paid_amount}")
                return False
        else:
            self.log_test("Invoice Status Update", False, f"Failed to get invoice: {response}", response)
            return False

    def test_get_payments(self):
        """Test getting all payments"""
        success, response = self.make_request('GET', '/payments', expected_status=200)
        
        if success and isinstance(response, list):
            payment_count = len(response)
            self.log_test("Get Payments", True, f"Retrieved {payment_count} payments")
            return True
        else:
            self.log_test("Get Payments", False, f"Failed to get payments: {response}", response)
            return False

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        success, response = self.make_request('GET', '/dashboard/stats', expected_status=200)
        
        if success:
            required_fields = ['total_invoices', 'total_amount', 'paid_amount', 'outstanding_amount', 
                             'unpaid_count', 'partial_count', 'paid_count', 'recent_payments']
            
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                self.log_test("Dashboard Stats", True, f"All required fields present. Total invoices: {response.get('total_invoices')}")
                return True
            else:
                self.log_test("Dashboard Stats", False, f"Missing fields: {missing_fields}")
                return False
        else:
            self.log_test("Dashboard Stats", False, f"Failed to get dashboard stats: {response}", response)
            return False

    def test_payment_deletion_and_status_recalculation(self):
        """Test payment deletion and invoice status recalculation"""
        if not self.test_payment_id:
            self.log_test("Payment Deletion", False, "No payment ID available for deletion test")
            return False
            
        # Delete the payment
        success, response = self.make_request('DELETE', f'/payments/{self.test_payment_id}', expected_status=200)
        
        if success:
            # Check if invoice status was recalculated
            success2, invoice_response = self.make_request('GET', f'/invoices/{self.test_invoice_id}', expected_status=200)
            
            if success2:
                status = invoice_response.get('status')
                paid_amount = invoice_response.get('paid_amount', 0)
                
                if status == 'unpaid' and paid_amount == 0:
                    self.log_test("Payment Deletion & Status Recalculation", True, "Payment deleted and invoice status recalculated correctly")
                    return True
                else:
                    self.log_test("Payment Deletion & Status Recalculation", False, f"Status not recalculated. Status: {status}, Paid: ${paid_amount}")
                    return False
            else:
                self.log_test("Payment Deletion & Status Recalculation", False, f"Failed to check invoice after payment deletion: {invoice_response}")
                return False
        else:
            self.log_test("Payment Deletion", False, f"Failed to delete payment: {response}", response)
            return False

    def test_cascade_delete_invoice(self):
        """Test invoice deletion cascades to payments"""
        if not self.test_invoice_id:
            self.log_test("Cascade Delete Invoice", False, "No invoice ID available for cascade delete test")
            return False
            
        # Create another payment first
        payment_data = {
            "invoice_id": self.test_invoice_id,
            "check_number": f"CHK-CASCADE-{datetime.now().strftime('%H%M%S')}",
            "check_date": datetime.now().strftime('%Y-%m-%d'),
            "bank_name": "Test Bank",
            "amount": 100.00
        }
        
        payment_success, payment_response = self.make_request('POST', '/payments', payment_data, 200)
        
        if payment_success:
            # Now delete the invoice
            success, response = self.make_request('DELETE', f'/invoices/{self.test_invoice_id}', expected_status=200)
            
            if success:
                # Check if payments were also deleted
                payments_success, payments_response = self.make_request('GET', '/payments', expected_status=200)
                
                if payments_success:
                    # Check if our test payments are gone
                    payment_ids = [p.get('invoice_id') for p in payments_response]
                    if self.test_invoice_id not in payment_ids:
                        self.log_test("Cascade Delete Invoice", True, "Invoice and associated payments deleted successfully")
                        return True
                    else:
                        self.log_test("Cascade Delete Invoice", False, "Payments not deleted when invoice was deleted")
                        return False
                else:
                    self.log_test("Cascade Delete Invoice", False, f"Failed to check payments after invoice deletion: {payments_response}")
                    return False
            else:
                self.log_test("Cascade Delete Invoice", False, f"Failed to delete invoice: {response}", response)
                return False
        else:
            self.log_test("Cascade Delete Invoice", False, f"Failed to create test payment: {payment_response}")
            return False

    def test_delete_customer(self):
        """Test customer deletion"""
        if not self.test_customer_id:
            self.log_test("Delete Customer", False, "No customer ID available for deletion test")
            return False
            
        success, response = self.make_request('DELETE', f'/customers/{self.test_customer_id}', expected_status=200)
        
        if success:
            self.log_test("Delete Customer", True, "Customer deleted successfully")
            return True
        else:
            self.log_test("Delete Customer", False, f"Failed to delete customer: {response}", response)
            return False

    def run_all_tests(self):
        """Run all API tests in sequence"""
        print("🚀 Starting Invoice Tracker API Tests...")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Authentication tests
        if not self.test_user_registration():
            print("❌ Registration failed - stopping tests")
            return False
            
        if not self.test_user_login():
            print("❌ Authentication failed - stopping tests")
            return False
        
        # Customer tests
        self.test_create_customer()
        self.test_get_customers()
        self.test_update_customer()
        
        # Invoice tests
        self.test_create_invoice()
        self.test_get_invoices()
        self.test_invoice_status_filtering()
        
        # Payment tests
        self.test_create_payment()
        self.test_invoice_status_update()
        self.test_get_payments()
        
        # Dashboard tests
        self.test_dashboard_stats()
        
        # Advanced functionality tests
        self.test_payment_deletion_and_status_recalculation()
        self.test_cascade_delete_invoice()
        self.test_delete_customer()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return False

def main():
    """Main test execution"""
    tester = InvoiceTrackerAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            'summary': {
                'total_tests': tester.tests_run,
                'passed_tests': tester.tests_passed,
                'success_rate': f"{(tester.tests_passed/tester.tests_run*100):.1f}%" if tester.tests_run > 0 else "0%",
                'timestamp': datetime.now().isoformat()
            },
            'detailed_results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())