#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Invoice Tracker Application
Tests all authentication, customer, invoice, payment, and dashboard endpoints
"""

import requests
import sys
import json
import pandas as pd
import io
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
        self.test_check_id = None

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

    def make_request(self, method: str, endpoint: str, data: Dict = None, expected_status: int = 200, files: Dict = None) -> tuple[bool, Dict]:
        """Make API request with error handling"""
        url = f"{self.api_url}/{endpoint.lstrip('/')}"
        headers = {}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        # Only set Content-Type for JSON requests (not for file uploads)
        if not files:
            headers['Content-Type'] = 'application/json'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files, headers=headers)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)
            else:
                return False, {"error": f"Unsupported method: {method}"}

            success = response.status_code == expected_status
            
            # For file downloads, return response object info
            if 'application/vnd.openxmlformats' in response.headers.get('content-type', '') or \
               'application/pdf' in response.headers.get('content-type', '') or \
               'application/vnd.openxmlformats-officedocument.wordprocessingml.document' in response.headers.get('content-type', ''):
                response_data = {
                    "content_type": response.headers.get('content-type'),
                    "content_disposition": response.headers.get('content-disposition'),
                    "content_length": len(response.content),
                    "status_code": response.status_code
                }
            else:
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

    def test_create_check(self):
        """Test check creation for export testing"""
        check_data = {
            "check_type": "received",
            "check_number": f"CHK-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "amount": 2500.00,
            "due_date": (datetime.now() + timedelta(days=15)).strftime('%Y-%m-%d'),
            "bank_name": "Test Bank A.Ş.",
            "payer_payee": "Test Payer Company",
            "notes": "Test check for export functionality"
        }
        
        success, response = self.make_request('POST', '/checks', check_data, 200)
        
        if success and 'id' in response:
            self.test_check_id = response['id']
            self.log_test("Create Check", True, f"Check created with ID: {self.test_check_id}")
            return True
        else:
            self.log_test("Create Check", False, f"Check creation failed: {response}", response)
            return False

    def create_test_excel_file(self, data_type: str) -> io.BytesIO:
        """Create test Excel files for import testing"""
        if data_type == "invoices":
            data = {
                'customer_id': [self.test_customer_id, self.test_customer_id],
                'customer_name': ['Test Customer Inc', 'Test Customer Inc'],
                'invoice_number': [f'IMP-INV-{datetime.now().strftime("%H%M%S")}-1', f'IMP-INV-{datetime.now().strftime("%H%M%S")}-2'],
                'amount': [1200.50, 850.75],
                'paid_amount': [0, 200.00],
                'due_date': ['2024-02-15', '2024-02-20'],
                'status': ['unpaid', 'partial'],
                'notes': ['Imported test invoice 1', 'Imported test invoice 2']
            }
        elif data_type == "checks":
            data = {
                'check_type': ['received', 'issued'],
                'check_number': [f'IMP-CHK-{datetime.now().strftime("%H%M%S")}-1', f'IMP-CHK-{datetime.now().strftime("%H%M%S")}-2'],
                'amount': [3000.00, 1500.00],
                'due_date': ['2024-02-10', '2024-02-25'],
                'bank_name': ['Import Test Bank', 'Another Test Bank'],
                'payer_payee': ['Import Test Payer', 'Import Test Payee'],
                'status': ['pending', 'pending'],
                'notes': ['Imported test check 1', 'Imported test check 2']
            }
        elif data_type == "payments":
            data = {
                'invoice_id': [self.test_invoice_id, self.test_invoice_id],
                'invoice_number': [f'INV-{datetime.now().strftime("%Y%m%d%H%M%S")}', f'INV-{datetime.now().strftime("%Y%m%d%H%M%S")}'],
                'customer_name': ['Test Customer Inc', 'Test Customer Inc'],
                'check_number': [f'PAY-CHK-{datetime.now().strftime("%H%M%S")}-1', f'PAY-CHK-{datetime.now().strftime("%H%M%S")}-2'],
                'check_date': ['2024-01-15', '2024-01-20'],
                'bank_name': ['Payment Test Bank', 'Another Payment Bank'],
                'amount': [500.00, 300.00]
            }
        else:
            return None
            
        df = pd.DataFrame(data)
        excel_buffer = io.BytesIO()
        df.to_excel(excel_buffer, index=False)
        excel_buffer.seek(0)
        return excel_buffer

    def test_export_invoices_xlsx(self):
        """Test exporting invoices to Excel format"""
        success, response = self.make_request('GET', '/export/invoices?format=xlsx', expected_status=200)
        
        if success:
            content_type = response.get('content_type', '')
            content_disposition = response.get('content_disposition', '')
            content_length = response.get('content_length', 0)
            
            if 'spreadsheet' in content_type and 'faturalar_' in content_disposition and content_length > 0:
                self.log_test("Export Invoices XLSX", True, f"Excel file exported successfully ({content_length} bytes)")
                return True
            else:
                self.log_test("Export Invoices XLSX", False, f"Invalid response format: {response}")
                return False
        else:
            self.log_test("Export Invoices XLSX", False, f"Export failed: {response}", response)
            return False

    def test_export_invoices_docx(self):
        """Test exporting invoices to Word format"""
        success, response = self.make_request('GET', '/export/invoices?format=docx', expected_status=200)
        
        if success:
            content_type = response.get('content_type', '')
            content_disposition = response.get('content_disposition', '')
            content_length = response.get('content_length', 0)
            
            if 'wordprocessingml' in content_type and 'faturalar_' in content_disposition and content_length > 0:
                self.log_test("Export Invoices DOCX", True, f"Word file exported successfully ({content_length} bytes)")
                return True
            else:
                self.log_test("Export Invoices DOCX", False, f"Invalid response format: {response}")
                return False
        else:
            self.log_test("Export Invoices DOCX", False, f"Export failed: {response}", response)
            return False

    def test_export_invoices_pdf(self):
        """Test exporting invoices to PDF format"""
        success, response = self.make_request('GET', '/export/invoices?format=pdf', expected_status=200)
        
        if success:
            content_type = response.get('content_type', '')
            content_disposition = response.get('content_disposition', '')
            content_length = response.get('content_length', 0)
            
            if 'pdf' in content_type and 'faturalar_' in content_disposition and content_length > 0:
                self.log_test("Export Invoices PDF", True, f"PDF file exported successfully ({content_length} bytes)")
                return True
            else:
                self.log_test("Export Invoices PDF", False, f"Invalid response format: {response}")
                return False
        else:
            self.log_test("Export Invoices PDF", False, f"Export failed: {response}", response)
            return False

    def test_export_checks_xlsx(self):
        """Test exporting checks to Excel format"""
        success, response = self.make_request('GET', '/export/checks?format=xlsx', expected_status=200)
        
        if success:
            content_type = response.get('content_type', '')
            content_disposition = response.get('content_disposition', '')
            content_length = response.get('content_length', 0)
            
            if 'spreadsheet' in content_type and 'cekler_' in content_disposition and content_length > 0:
                self.log_test("Export Checks XLSX", True, f"Excel file exported successfully ({content_length} bytes)")
                return True
            else:
                self.log_test("Export Checks XLSX", False, f"Invalid response format: {response}")
                return False
        else:
            self.log_test("Export Checks XLSX", False, f"Export failed: {response}", response)
            return False

    def test_export_checks_docx(self):
        """Test exporting checks to Word format"""
        success, response = self.make_request('GET', '/export/checks?format=docx', expected_status=200)
        
        if success:
            content_type = response.get('content_type', '')
            content_disposition = response.get('content_disposition', '')
            content_length = response.get('content_length', 0)
            
            if 'wordprocessingml' in content_type and 'cekler_' in content_disposition and content_length > 0:
                self.log_test("Export Checks DOCX", True, f"Word file exported successfully ({content_length} bytes)")
                return True
            else:
                self.log_test("Export Checks DOCX", False, f"Invalid response format: {response}")
                return False
        else:
            self.log_test("Export Checks DOCX", False, f"Export failed: {response}", response)
            return False

    def test_export_checks_pdf(self):
        """Test exporting checks to PDF format"""
        success, response = self.make_request('GET', '/export/checks?format=pdf', expected_status=200)
        
        if success:
            content_type = response.get('content_type', '')
            content_disposition = response.get('content_disposition', '')
            content_length = response.get('content_length', 0)
            
            if 'pdf' in content_type and 'cekler_' in content_disposition and content_length > 0:
                self.log_test("Export Checks PDF", True, f"PDF file exported successfully ({content_length} bytes)")
                return True
            else:
                self.log_test("Export Checks PDF", False, f"Invalid response format: {response}")
                return False
        else:
            self.log_test("Export Checks PDF", False, f"Export failed: {response}", response)
            return False

    def test_export_payments_xlsx(self):
        """Test exporting payments to Excel format"""
        success, response = self.make_request('GET', '/export/payments?format=xlsx', expected_status=200)
        
        if success:
            content_type = response.get('content_type', '')
            content_disposition = response.get('content_disposition', '')
            content_length = response.get('content_length', 0)
            
            if 'spreadsheet' in content_type and 'odemeler_' in content_disposition and content_length > 0:
                self.log_test("Export Payments XLSX", True, f"Excel file exported successfully ({content_length} bytes)")
                return True
            else:
                self.log_test("Export Payments XLSX", False, f"Invalid response format: {response}")
                return False
        else:
            self.log_test("Export Payments XLSX", False, f"Export failed: {response}", response)
            return False

    def test_export_payments_docx(self):
        """Test exporting payments to Word format"""
        success, response = self.make_request('GET', '/export/payments?format=docx', expected_status=200)
        
        if success:
            content_type = response.get('content_type', '')
            content_disposition = response.get('content_disposition', '')
            content_length = response.get('content_length', 0)
            
            if 'wordprocessingml' in content_type and 'odemeler_' in content_disposition and content_length > 0:
                self.log_test("Export Payments DOCX", True, f"Word file exported successfully ({content_length} bytes)")
                return True
            else:
                self.log_test("Export Payments DOCX", False, f"Invalid response format: {response}")
                return False
        else:
            self.log_test("Export Payments DOCX", False, f"Export failed: {response}", response)
            return False

    def test_export_payments_pdf(self):
        """Test exporting payments to PDF format"""
        success, response = self.make_request('GET', '/export/payments?format=pdf', expected_status=200)
        
        if success:
            content_type = response.get('content_type', '')
            content_disposition = response.get('content_disposition', '')
            content_length = response.get('content_length', 0)
            
            if 'pdf' in content_type and 'odemeler_' in content_disposition and content_length > 0:
                self.log_test("Export Payments PDF", True, f"PDF file exported successfully ({content_length} bytes)")
                return True
            else:
                self.log_test("Export Payments PDF", False, f"Invalid response format: {response}")
                return False
        else:
            self.log_test("Export Payments PDF", False, f"Export failed: {response}", response)
            return False

    def test_export_weekly_schedule_xlsx(self):
        """Test exporting weekly schedule to Excel format"""
        success, response = self.make_request('GET', '/export/weekly-schedule?format=xlsx', expected_status=200)
        
        if success:
            content_type = response.get('content_type', '')
            content_disposition = response.get('content_disposition', '')
            content_length = response.get('content_length', 0)
            
            if 'spreadsheet' in content_type and 'haftalik_plan_' in content_disposition and content_length > 0:
                self.log_test("Export Weekly Schedule XLSX", True, f"Excel file exported successfully ({content_length} bytes)")
                return True
            else:
                self.log_test("Export Weekly Schedule XLSX", False, f"Invalid response format: {response}")
                return False
        else:
            self.log_test("Export Weekly Schedule XLSX", False, f"Export failed: {response}", response)
            return False

    def test_export_weekly_schedule_docx(self):
        """Test exporting weekly schedule to Word format"""
        success, response = self.make_request('GET', '/export/weekly-schedule?format=docx', expected_status=200)
        
        if success:
            content_type = response.get('content_type', '')
            content_disposition = response.get('content_disposition', '')
            content_length = response.get('content_length', 0)
            
            if 'wordprocessingml' in content_type and 'haftalik_plan_' in content_disposition and content_length > 0:
                self.log_test("Export Weekly Schedule DOCX", True, f"Word file exported successfully ({content_length} bytes)")
                return True
            else:
                self.log_test("Export Weekly Schedule DOCX", False, f"Invalid response format: {response}")
                return False
        else:
            self.log_test("Export Weekly Schedule DOCX", False, f"Export failed: {response}", response)
            return False

    def test_export_weekly_schedule_pdf(self):
        """Test exporting weekly schedule to PDF format"""
        success, response = self.make_request('GET', '/export/weekly-schedule?format=pdf', expected_status=200)
        
        if success:
            content_type = response.get('content_type', '')
            content_disposition = response.get('content_disposition', '')
            content_length = response.get('content_length', 0)
            
            if 'pdf' in content_type and 'haftalik_plan_' in content_disposition and content_length > 0:
                self.log_test("Export Weekly Schedule PDF", True, f"PDF file exported successfully ({content_length} bytes)")
                return True
            else:
                self.log_test("Export Weekly Schedule PDF", False, f"Invalid response format: {response}")
                return False
        else:
            self.log_test("Export Weekly Schedule PDF", False, f"Export failed: {response}", response)
            return False

    def test_import_invoices(self):
        """Test importing invoices from Excel file"""
        if not self.test_customer_id:
            self.log_test("Import Invoices", False, "No customer ID available for import test")
            return False
            
        excel_file = self.create_test_excel_file("invoices")
        if not excel_file:
            self.log_test("Import Invoices", False, "Failed to create test Excel file")
            return False
            
        files = {'file': ('test_invoices.xlsx', excel_file, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
        success, response = self.make_request('POST', '/import/invoices', files=files, expected_status=200)
        
        if success and 'count' in response:
            imported_count = response.get('count', 0)
            self.log_test("Import Invoices", True, f"Successfully imported {imported_count} invoices")
            return True
        else:
            self.log_test("Import Invoices", False, f"Import failed: {response}", response)
            return False

    def test_import_checks(self):
        """Test importing checks from Excel file"""
        excel_file = self.create_test_excel_file("checks")
        if not excel_file:
            self.log_test("Import Checks", False, "Failed to create test Excel file")
            return False
            
        files = {'file': ('test_checks.xlsx', excel_file, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
        success, response = self.make_request('POST', '/import/checks', files=files, expected_status=200)
        
        if success and 'count' in response:
            imported_count = response.get('count', 0)
            self.log_test("Import Checks", True, f"Successfully imported {imported_count} checks")
            return True
        else:
            self.log_test("Import Checks", False, f"Import failed: {response}", response)
            return False

    def test_import_payments(self):
        """Test importing payments from Excel file"""
        if not self.test_invoice_id:
            self.log_test("Import Payments", False, "No invoice ID available for import test")
            return False
            
        excel_file = self.create_test_excel_file("payments")
        if not excel_file:
            self.log_test("Import Payments", False, "Failed to create test Excel file")
            return False
            
        files = {'file': ('test_payments.xlsx', excel_file, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
        success, response = self.make_request('POST', '/import/payments', files=files, expected_status=200)
        
        if success and 'count' in response:
            imported_count = response.get('count', 0)
            self.log_test("Import Payments", True, f"Successfully imported {imported_count} payments")
            return True
        else:
            self.log_test("Import Payments", False, f"Import failed: {response}", response)
            return False

    def test_export_invalid_format(self):
        """Test export with invalid format parameter"""
        success, response = self.make_request('GET', '/export/invoices?format=invalid', expected_status=400)
        
        if success:
            self.log_test("Export Invalid Format", True, "Correctly rejected invalid format")
            return True
        else:
            self.log_test("Export Invalid Format", False, f"Should have rejected invalid format: {response}")
            return False

    # Phase 2 Tests - Dashboard Export
    def test_export_dashboard_stats_xlsx(self):
        """Test exporting dashboard statistics to Excel format"""
        success, response = self.make_request('GET', '/export/dashboard-stats?format=xlsx', expected_status=200)
        
        if success:
            content_type = response.get('content_type', '')
            content_disposition = response.get('content_disposition', '')
            content_length = response.get('content_length', 0)
            
            if 'spreadsheet' in content_type and ('dashboard_stats_' in content_disposition or 'dashboard_ozet_' in content_disposition) and content_length > 0:
                self.log_test("Export Dashboard Stats XLSX", True, f"Excel file exported successfully ({content_length} bytes)")
                return True
            else:
                self.log_test("Export Dashboard Stats XLSX", False, f"Invalid response format: {response}")
                return False
        else:
            self.log_test("Export Dashboard Stats XLSX", False, f"Export failed: {response}", response)
            return False

    def test_export_dashboard_stats_docx(self):
        """Test exporting dashboard statistics to Word format"""
        success, response = self.make_request('GET', '/export/dashboard-stats?format=docx', expected_status=200)
        
        if success:
            content_type = response.get('content_type', '')
            content_disposition = response.get('content_disposition', '')
            content_length = response.get('content_length', 0)
            
            if 'wordprocessingml' in content_type and ('dashboard_stats_' in content_disposition or 'dashboard_ozet_' in content_disposition) and content_length > 0:
                self.log_test("Export Dashboard Stats DOCX", True, f"Word file exported successfully ({content_length} bytes)")
                return True
            else:
                self.log_test("Export Dashboard Stats DOCX", False, f"Invalid response format: {response}")
                return False
        else:
            self.log_test("Export Dashboard Stats DOCX", False, f"Export failed: {response}", response)
            return False

    def test_export_dashboard_stats_pdf(self):
        """Test exporting dashboard statistics to PDF format"""
        success, response = self.make_request('GET', '/export/dashboard-stats?format=pdf', expected_status=200)
        
        if success:
            content_type = response.get('content_type', '')
            content_disposition = response.get('content_disposition', '')
            content_length = response.get('content_length', 0)
            
            if 'pdf' in content_type and ('dashboard_stats_' in content_disposition or 'dashboard_ozet_' in content_disposition) and content_length > 0:
                self.log_test("Export Dashboard Stats PDF", True, f"PDF file exported successfully ({content_length} bytes)")
                return True
            else:
                self.log_test("Export Dashboard Stats PDF", False, f"Invalid response format: {response}")
                return False
        else:
            self.log_test("Export Dashboard Stats PDF", False, f"Export failed: {response}", response)
            return False

    # Phase 2 Tests - Logo Management
    def create_test_png_image(self) -> io.BytesIO:
        """Create a simple test PNG image (200x200px)"""
        try:
            from PIL import Image, ImageDraw
            
            # Create a 200x200 image with a simple pattern
            img = Image.new('RGB', (200, 200), color='white')
            draw = ImageDraw.Draw(img)
            
            # Draw a simple logo pattern
            draw.rectangle([50, 50, 150, 150], fill='blue', outline='black', width=2)
            draw.text((75, 95), "LOGO", fill='white')
            
            # Save to BytesIO
            img_buffer = io.BytesIO()
            img.save(img_buffer, format='PNG')
            img_buffer.seek(0)
            return img_buffer
            
        except ImportError:
            # Fallback: create a minimal PNG file manually
            # This is a minimal valid PNG file (1x1 pixel)
            png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\x0bIDATx\x9cc```\x00\x00\x00\x04\x00\x01\xdd\x8d\xb4\x1c\x00\x00\x00\x00IEND\xaeB`\x82'
            return io.BytesIO(png_data)

    def test_logo_upload_admin(self):
        """Test logo upload as admin user"""
        # First, we need to make sure we have admin privileges
        # The test user should be admin (first user or turyasin@gmail.com)
        
        png_file = self.create_test_png_image()
        files = {'file': ('test_logo.png', png_file, 'image/png')}
        
        success, response = self.make_request('POST', '/settings/logo', files=files, expected_status=200)
        
        if success:
            self.log_test("Logo Upload (Admin)", True, f"Logo uploaded successfully: {response}")
            return True
        else:
            self.log_test("Logo Upload (Admin)", False, f"Logo upload failed: {response}", response)
            return False

    def test_logo_get_public(self):
        """Test getting logo (public endpoint)"""
        success, response = self.make_request('GET', '/settings/logo', expected_status=200)
        
        if success:
            content_type = response.get('content_type', '')
            content_length = response.get('content_length', 0)
            
            if 'image' in content_type and content_length > 0:
                self.log_test("Get Logo (Public)", True, f"Logo retrieved successfully ({content_length} bytes, {content_type})")
                return True
            else:
                self.log_test("Get Logo (Public)", False, f"Invalid logo response: {response}")
                return False
        else:
            # If no logo exists, we should get 404
            if response.get('status_code') == 404:
                self.log_test("Get Logo (Public)", True, "Correctly returned 404 when no logo exists")
                return True
            else:
                self.log_test("Get Logo (Public)", False, f"Unexpected response: {response}", response)
                return False

    def test_logo_upload_non_png(self):
        """Test logo upload with non-PNG file (should fail)"""
        # Create a fake text file
        text_file = io.BytesIO(b"This is not a PNG file")
        files = {'file': ('test.txt', text_file, 'text/plain')}
        
        success, response = self.make_request('POST', '/settings/logo', files=files, expected_status=400)
        
        if success:
            self.log_test("Logo Upload Non-PNG", True, "Correctly rejected non-PNG file")
            return True
        else:
            self.log_test("Logo Upload Non-PNG", False, f"Should have rejected non-PNG file: {response}")
            return False

    def test_logo_delete_admin(self):
        """Test logo deletion as admin user"""
        success, response = self.make_request('DELETE', '/settings/logo', expected_status=200)
        
        if success:
            self.log_test("Logo Delete (Admin)", True, f"Logo deleted successfully: {response}")
            return True
        else:
            self.log_test("Logo Delete (Admin)", False, f"Logo deletion failed: {response}", response)
            return False

    def test_logo_get_after_deletion(self):
        """Test getting logo after deletion (should return 404)"""
        success, response = self.make_request('GET', '/settings/logo', expected_status=404)
        
        if success:
            self.log_test("Get Logo After Deletion", True, "Correctly returned 404 after logo deletion")
            return True
        else:
            self.log_test("Get Logo After Deletion", False, f"Should have returned 404: {response}")
            return False

    def test_create_non_admin_user(self):
        """Create a non-admin user for testing admin restrictions"""
        test_email = f"nonadmin_{datetime.now().strftime('%H%M%S')}@example.com"
        user_data = {
            "username": f"nonadmin_{datetime.now().strftime('%H%M%S')}",
            "email": test_email,
            "password": "TestPassword123!"
        }
        
        success, response = self.make_request('POST', '/auth/register', user_data, 200)
        
        if success and 'token' in response:
            # Store the non-admin token temporarily
            self.non_admin_token = response['token']
            self.log_test("Create Non-Admin User", True, f"Non-admin user created: {test_email}")
            return True
        else:
            self.log_test("Create Non-Admin User", False, f"Failed to create non-admin user: {response}", response)
            return False

    def test_logo_upload_non_admin(self):
        """Test logo upload as non-admin user (should fail)"""
        if not hasattr(self, 'non_admin_token'):
            self.log_test("Logo Upload Non-Admin", False, "No non-admin token available")
            return False
            
        # Temporarily switch to non-admin token
        original_token = self.token
        self.token = self.non_admin_token
        
        png_file = self.create_test_png_image()
        files = {'file': ('test_logo.png', png_file, 'image/png')}
        
        success, response = self.make_request('POST', '/settings/logo', files=files, expected_status=403)
        
        # Restore original token
        self.token = original_token
        
        if success:
            self.log_test("Logo Upload Non-Admin", True, "Correctly rejected non-admin user")
            return True
        else:
            self.log_test("Logo Upload Non-Admin", False, f"Should have rejected non-admin user: {response}")
            return False

    def test_logo_delete_non_admin(self):
        """Test logo deletion as non-admin user (should fail)"""
        if not hasattr(self, 'non_admin_token'):
            self.log_test("Logo Delete Non-Admin", False, "No non-admin token available")
            return False
            
        # Temporarily switch to non-admin token
        original_token = self.token
        self.token = self.non_admin_token
        
        success, response = self.make_request('DELETE', '/settings/logo', expected_status=403)
        
        # Restore original token
        self.token = original_token
        
        if success:
            self.log_test("Logo Delete Non-Admin", True, "Correctly rejected non-admin user")
            return True
        else:
            self.log_test("Logo Delete Non-Admin", False, f"Should have rejected non-admin user: {response}")
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
        
        # Check tests (needed for export testing)
        self.test_create_check()
        
        # Payment tests
        self.test_create_payment()
        self.test_invoice_status_update()
        self.test_get_payments()
        
        # Dashboard tests
        self.test_dashboard_stats()
        
        print("\n" + "=" * 60)
        print("🔄 Testing Import/Export Functionality...")
        print("=" * 60)
        
        # Export tests - Invoices
        self.test_export_invoices_xlsx()
        self.test_export_invoices_docx()
        self.test_export_invoices_pdf()
        
        # Export tests - Checks
        self.test_export_checks_xlsx()
        self.test_export_checks_docx()
        self.test_export_checks_pdf()
        
        # Export tests - Payments
        self.test_export_payments_xlsx()
        self.test_export_payments_docx()
        self.test_export_payments_pdf()
        
        # Export tests - Weekly Schedule
        self.test_export_weekly_schedule_xlsx()
        self.test_export_weekly_schedule_docx()
        self.test_export_weekly_schedule_pdf()
        
        # Import tests
        self.test_import_invoices()
        self.test_import_checks()
        self.test_import_payments()
        
        # Error handling tests
        self.test_export_invalid_format()
        
        print("\n" + "=" * 60)
        print("🔄 Testing Phase 2 Features - Dashboard Export...")
        print("=" * 60)
        
        # Phase 2 - Dashboard Export tests
        self.test_export_dashboard_stats_xlsx()
        self.test_export_dashboard_stats_docx()
        self.test_export_dashboard_stats_pdf()
        
        print("\n" + "=" * 60)
        print("🔄 Testing Phase 2 Features - Logo Management...")
        print("=" * 60)
        
        # Phase 2 - Logo Management tests
        # First test getting logo when none exists
        self.test_logo_get_public()
        
        # Test logo upload as admin
        self.test_logo_upload_admin()
        
        # Test getting logo after upload
        self.test_logo_get_public()
        
        # Test non-PNG file upload (should fail)
        self.test_logo_upload_non_png()
        
        # Create non-admin user for permission tests
        self.test_create_non_admin_user()
        
        # Test non-admin access (should fail)
        self.test_logo_upload_non_admin()
        self.test_logo_delete_non_admin()
        
        # Test logo deletion as admin
        self.test_logo_delete_admin()
        
        # Test getting logo after deletion (should return 404)
        self.test_logo_get_after_deletion()
        
        print("\n" + "=" * 60)
        print("🔄 Testing Advanced Functionality...")
        print("=" * 60)
        
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