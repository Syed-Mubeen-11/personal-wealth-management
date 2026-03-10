from models.goal_model import Goal


def create_goal(db, user_id, goal):

    new_goal = Goal(
        user_id=user_id,
        goal_type=goal.goal_type,
        target_amount=goal.target_amount,
        target_date=goal.target_date,
        monthly_contribution=goal.monthly_contribution
    )

    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)

    return new_goal

def get_user_goals(db, user_id):

    return db.query(Goal).filter(Goal.user_id == user_id).all()

def update_goal(db, goal_id, user_id, goal_data):

    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == user_id
    ).first()

    if not goal:
        return None

    if goal_data.goal_type is not None:
        goal.goal_type = goal_data.goal_type

    if goal_data.target_amount is not None:
        goal.target_amount = goal_data.target_amount

    if goal_data.target_date is not None:
        goal.target_date = goal_data.target_date

    if goal_data.monthly_contribution is not None:
        goal.monthly_contribution = goal_data.monthly_contribution

    if goal_data.status is not None:
        goal.status = goal_data.status

    db.commit()
    db.refresh(goal)

    return goal

def delete_goal(db, goal_id, user_id):

    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == user_id
    ).first()

    if not goal:
        return False

    db.delete(goal)
    db.commit()

    return True