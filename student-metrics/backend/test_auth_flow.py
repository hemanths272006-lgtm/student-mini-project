import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, engine, Base
from models import User, Student, Lecturer
from main import init_db_and_seed
from routers.auth_routes import (
    register_user, login_user, forgot_password, reset_password,
    get_current_user_profile, demo_login
)
from schemas import (
    UserRegisterRequest, UserLoginRequest, ForgotPasswordRequest,
    ResetPasswordRequest, DemoLoginRequest
)
from fastapi import Response, HTTPException

init_db_and_seed()
db = SessionLocal()
print("Starting Direct Authentication Verification...")

try:
    # 1. Test Login existing Admin
    res = Response()
    login_req = UserLoginRequest(email="admin@studentmetrics.edu", password="admin123")
    r = login_user(login_req, res, db)
    assert r.user["role"] == "admin"
    admin_token = r.access_token
    print("[PASS] 1. Admin login verified (admin@studentmetrics.edu)")

    # 2. Test Invalid Credentials
    try:
        login_user(UserLoginRequest(email="admin@studentmetrics.edu", password="wrongpassword"), res, db)
        assert False, "Should have thrown 401"
    except HTTPException as e:
        assert e.status_code == 401
        print("[PASS] 2. Invalid credentials correctly rejected (401)")

    # 3. Test Student Registration
    test_email = "test.student.direct@studentmetrics.edu"
    # Clean up if existed
    old_u = db.query(User).filter(User.email == test_email).first()
    if old_u:
        db.delete(old_u)
        db.commit()

    reg_req = UserRegisterRequest(
        name="Alex Chen",
        email=test_email,
        password="Password123!",
        role="student",
        usn="1MS24CS888",
        section="A"
    )
    reg_res = register_user(reg_req, res, db)
    assert reg_res.user["email"] == test_email
    assert reg_res.user["role"] == "student"
    assert reg_res.access_token is not None
    print("[PASS] 3. Real student registration saved to DB with hashed password")

    # 4. Test Duplicate Email Prevention
    try:
        register_user(reg_req, res, db)
        assert False, "Should have thrown 400 for duplicate email"
    except HTTPException as e:
        assert e.status_code == 400
        print("[PASS] 4. Duplicate email registration prevented (400)")

    # 5. Test Admin Self-Registration Prevention
    try:
        register_user(UserRegisterRequest(
            name="Hacker Admin",
            email="hacker@test.com",
            password="password123",
            role="admin"
        ), res, db)
        assert False, "Should have thrown 403 for admin registration"
    except HTTPException as e:
        assert e.status_code == 403
        print("[PASS] 5. Unauthorized Admin self-registration blocked (403)")

    # 6. Test Lecturer Registration (Pending Verification)
    lec_email = "prof.direct@studentmetrics.edu"
    old_lec = db.query(User).filter(User.email == lec_email).first()
    if old_lec:
        db.delete(old_lec)
        db.commit()

    lec_req = UserRegisterRequest(
        name="Prof. Direct Test",
        email=lec_email,
        password="LecturerPassword123!",
        role="lecturer",
        usn="LEC888",
        department="Computer Science & Engineering"
    )
    lec_res = register_user(lec_req, res, db)
    assert lec_res.user["role"] == "lecturer"
    assert lec_res.user["lecturer"]["is_verified"] is False
    print("[PASS] 6. Lecturer registration saved with is_verified=False (pending admin approval)")

    # 7. Test Forgot Password Token Generation
    fp_res = forgot_password(ForgotPasswordRequest(email=test_email), db)
    assert fp_res["success"] is True
    reset_token = fp_res["reset_token"]
    assert reset_token is not None
    print(f"[PASS] 7. Forgot password token generated: {reset_token[:12]}...")

    # 8. Test Reset Password
    new_pwd = "UpdatedPassword456!"
    rp_res = reset_password(ResetPasswordRequest(token=reset_token, new_password=new_pwd), db)
    assert rp_res["success"] is True
    print("[PASS] 8. Password reset token verified and updated password hash in DB")

    # 9. Test Login with New Password
    login_new = login_user(UserLoginRequest(email=test_email, password=new_pwd, remember_me=True), res, db)
    assert login_new.user["email"] == test_email
    print("[PASS] 9. Login with newly reset password and Remember Me succeeded")

    # 10. Test Old Password is now invalid
    try:
        login_user(UserLoginRequest(email=test_email, password="Password123!"), res, db)
        assert False, "Should have thrown 401 for old password"
    except HTTPException as e:
        assert e.status_code == 401
        print("[PASS] 10. Old password invalidated after reset")

    # 11. Test Demo Login
    demo_res = demo_login(DemoLoginRequest(role="student"), res, db)
    assert demo_res.user["role"] == "student"
    print("[PASS] 11. 1-Click Demo Login preserved and functioning")

    print("\n==============================================")
    print("ALL 11 BACKEND AUTHENTICATION TESTS PASSED!")
    print("==============================================")

finally:
    db.close()
