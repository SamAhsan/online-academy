"""
Payment management API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from auth import get_current_admin_user
import schemas
import crud
import models

router = APIRouter(prefix="/api/payments", tags=["Payments"])


@router.post("/", response_model=schemas.PaymentResponse, status_code=status.HTTP_201_CREATED)
def create_payment(
    payment: schemas.PaymentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user),
):
    """
    Create a new payment record (Admin only)
    """
    # Verify student exists
    student = crud.get_student(db, payment.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    return crud.create_payment(db=db, payment=payment)


@router.get("/", response_model=List[schemas.PaymentWithStudent])
def list_payments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    student_id: Optional[int] = None,
    status: Optional[str] = None,
    month: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user),
):
    """
    Get list of payments with optional filtering (Admin only)
    """
    payments = crud.get_payments(
        db=db, skip=skip, limit=limit, student_id=student_id, status=status, month=month
    )

    # Add student name
    result = []
    for payment in payments:
        payment_dict = payment.__dict__
        payment_dict["student_name"] = payment.student.name if payment.student else "Unknown"
        result.append(payment_dict)

    return result


@router.get("/{payment_id}", response_model=schemas.PaymentWithStudent)
def get_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user),
):
    """
    Get a specific payment by ID (Admin only)
    """
    db_payment = crud.get_payment(db, payment_id=payment_id)
    if db_payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")

    payment_dict = db_payment.__dict__
    payment_dict["student_name"] = db_payment.student.name if db_payment.student else "Unknown"

    return payment_dict


@router.put("/{payment_id}", response_model=schemas.PaymentResponse)
def update_payment(
    payment_id: int,
    payment: schemas.PaymentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user),
):
    """
    Update a payment (Admin only)
    """
    db_payment = crud.update_payment(db, payment_id=payment_id, payment=payment)
    if db_payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")
    return db_payment


@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user),
):
    """
    Delete a payment (Admin only)
    """
    success = crud.delete_payment(db, payment_id=payment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Payment not found")
    return None


@router.post("/{payment_id}/mark-paid", response_model=schemas.PaymentResponse)
def mark_payment_paid(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user),
):
    """
    Mark a payment as paid (Admin only)
    """
    payment_update = schemas.PaymentUpdate(status=models.FeeStatus.PAID)
    db_payment = crud.update_payment(db, payment_id=payment_id, payment=payment_update)
    if db_payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")
    return db_payment
