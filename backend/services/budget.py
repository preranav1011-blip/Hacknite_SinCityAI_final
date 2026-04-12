def check_and_adjust_budget(itinerary_data: dict, target_budget: int):
    """
    Evaluates the generated JSON's total cost.
    If it exceeds the budget, it adds a warning flag.
    In a more advanced implementation, this could recursively call the LLM to lower the cost.
    """
    
    if "error" in itinerary_data:
        return itinerary_data

    actual_cost = itinerary_data.get("total_cost", 0)
    
    if actual_cost > target_budget:
        itinerary_data["budget_warning"] = f"Caution! The planned cost (${actual_cost}) exceeds your budget (${target_budget}). You can ask me to make it cheaper."
        
    return itinerary_data
