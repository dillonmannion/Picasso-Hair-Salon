# Discovery Question Answers

## Q1: Will this feature have a user-facing interface?

**Answer:** no
**Details:** Purely backend

## Q2: Does this feature need to store new data or modify existing data structures?

**Answer:** yes
**Details:** The database is in a completely fungible state, feel free to delete, change, or modify any of the current functionality to fit the implementation goals.

## Q3: Will this feature integrate with any third-party APIs or services?

**Answer:** no
**Details:** Supabase is the only integration needed at this point.

## Q4: Does this feature involve user authentication or authorization?

**Answer:** yes
**Details:** Three authorization levels:

1. **Non-authenticated users**: Can view pages in template format (for user-specific data) or shared views (gallery page showing haircut images)
2. **Employees**: Can access their hair stylist page to update skills, certifications, vacation time, work days, etc.
3. **Admins** (owners and dev): Full access including admin overlay for viewing business info, changing discounts, stylists, haircut services offered, etc.

## Q5: Are there specific performance or scalability requirements?

**Answer:** no
**Details:** Current capacity should simply be a working mockup of the website that showcases all basic functionality, performance isn't a vital factor but should at least be kept in mind for future refactors.

## Q6: Will this feature use any external libraries or frameworks that require documentation lookup?

**Answer:** yes
**Details:** supabase/js is the main reference point for Supabase related documentation.
