# Reporting Time & Punctuality Feature

## Overview

The system automatically tracks instructor arrivals against a configurable buffer time and marks them as **on-time** or **late**.

## How It Works

### 1. **Defining Reporting Time**

When an admin creates a duty assignment:

```
Reporting Time: 09:00
Deadline Buffer: 30 minutes (configurable)
```

This means:
- **Exam starts at:** 09:00
- **Deadline to be on-time:** 08:30 (09:00 - 30 minutes)
- **Instructors must arrive by:** 08:30 to be marked as **on-time**
- **If arrives after 08:30:** Marked as **late**

### 2. **Setting Deadline Buffer**

In the **Admin → Duties** panel:

1. Click **"+ Assign Duty"**
2. Fill in Exam, Instructor, Room
3. Set **Reporting Time** (when exam starts)
4. Set **Deadline Buffer in Minutes** (default: 30)
5. Click **Assign Duty**

The deadline buffer is **flexible** per duty:
- Standard exams: 30 minutes
- High-security exams: 45 minutes
- Quick-turnaround: 15 minutes

### 3. **Instructor View**

When instructor logs in and views their duty:

```
Exam: Data Structures
Reporting Time: 09:00 AM
Arrive by: 08:30 AM to be on time
[ARRIVED 🥳] button
```

The arrival button is **only visible**:
- Starting from 10 minutes before reporting time
- Until the reporting time

Example: If reporting time is 09:00:
- Button appears at: 08:50
- Button disappears at: 09:00

### 4. **Marking Arrival**

Instructor clicks **"ARRIVED 🥳"** button:

1. System captures current time
2. Compares with deadline (reporting_time - deadline_minutes)
3. Marks as:
   - **on-time** if: arrival_time ≤ deadline
   - **late** if: arrival_time > deadline

### 5. **Admin Monitoring**

In **Admin → Duties** panel:

**Status Indicators:**
- 🟢 **Green**: All instructors arrived on-time
- 🟡 **Yellow**: Some instructors late
- 🔴 **Red**: Not yet arrived (after reporting time)

**Table shows:**
- Reporting Time: 09:00
- Arrival Time: 08:45
- Status: on-time ✅

### 6. **Real-time Updates**

When instructor marks arrival:
- ✅ Admin dashboard updates instantly
- ✅ Statistics recalculate automatically
- ✅ Instructor stats updated

## Database Setup

### One-Time Setup

1. Run `supabase/schema.sql` (creates duties table)
2. Run `supabase/SETUP_ONCE.sql` (enables all features)
3. Run `supabase/add-deadline-minutes-column.sql` (adds deadline_minutes column)

### Database Schema

```sql
CREATE TABLE duties (
  id UUID PRIMARY KEY,
  exam_id UUID,           -- Which exam
  room_id UUID,           -- Which room
  instructor_id UUID,     -- Which instructor
  reporting_time TIME,    -- When exam starts (e.g., "09:00")
  deadline_minutes INT,   -- Minutes before to be on-time (default: 30)
  arrival_time TIMESTAMP, -- When instructor actually arrived
  status TEXT,            -- 'pending', 'on-time', 'late'
  created_at TIMESTAMP
);
```

## Calculation Logic

### Deadline Calculation

```javascript
function getDeadline(reportingTime, deadlineMinutes = 30) {
  // Parse "09:00" → 9:00 AM
  const [hours, minutes] = reportingTime.split(':').map(Number);
  
  // Create today at that time
  const reporting = new Date();
  reporting.setHours(hours, minutes, 0, 0);
  
  // Subtract deadline minutes
  const deadline = new Date(reporting.getTime() - deadlineMinutes * 60 * 1000);
  
  return deadline;
}
```

### Status Calculation

```javascript
function validateArrival(reportingTime, arrivalTime, deadlineMinutes = 30) {
  const deadline = getDeadline(reportingTime, deadlineMinutes);
  
  if (arrivalTime <= deadline) {
    return 'on-time';  // ✅
  } else {
    return 'late';     // ⚠️
  }
}
```

## Examples

### Example 1: Standard 30-minute Buffer

| Item | Value |
|------|-------|
| Reporting Time | 09:00 |
| Deadline Buffer | 30 min |
| Deadline | 08:30 |
| Arrived At | 08:25 |
| **Status** | **✅ on-time** |

### Example 2: Late Arrival

| Item | Value |
|------|-------|
| Reporting Time | 10:00 |
| Deadline Buffer | 30 min |
| Deadline | 09:30 |
| Arrived At | 09:45 |
| **Status** | **⚠️ late** |

### Example 3: Custom Buffer

| Item | Value |
|------|-------|
| Reporting Time | 14:00 |
| Deadline Buffer | 45 min |
| Deadline | 13:15 |
| Arrived At | 13:20 |
| **Status** | **⚠️ late** |

## Statistics

Instructor stats are **auto-calculated**:

```javascript
Total Duties = Count of all duty assignments
On-Time Count = Count where status = 'on-time'
Late Count = Count where status = 'late'
Pending Count = Count where status = 'pending'

Punctuality Rate = (On-Time Count / Completed) * 100
```

## Troubleshooting

### "Arrive by" time shows incorrectly?

**Issue:** The deadline time display doesn't match expectations

**Solution:** Check that `deadline_minutes` column exists in database
```bash
# Run this in Supabase SQL Editor:
SELECT * FROM duties LIMIT 1;
# Check if deadline_minutes column appears
```

### Arrival button doesn't appear?

**Possible causes:**
1. ❌ Not within 10 minutes of reporting time
2. ❌ Duty already marked (status != 'pending')
3. ❌ Not assigned to this instructor
4. ❌ Exam date is not today

**Test:**
- Go to upcoming duty from today
- Wait until 10 minutes before reporting time
- Button should appear

### Status calculated incorrectly?

**Debug steps:**
1. Open browser F12 → Console
2. Look for logs when marking arrival
3. Check exact times being compared
4. Verify `deadline_minutes` is being passed

## Configuration

### Default Buffer: 30 minutes

To change globally, edit `src/pages/admin/Duties.jsx`:

```javascript
// Line 29
deadline_minutes: 15  // Change from 30 to 15
```

### Per-Duty Custom Buffer

Each duty can have its own buffer:
- Create duty with reporting time 09:00
- Set deadline buffer to 45 minutes
- That specific duty requires arrival by 08:15

## Real-world Scenarios

### Scenario 1: Regular Class Exam
- Reporting Time: 09:00
- Buffer: 30 minutes
- Deadline: 08:30
- Teachers typically arrive 20-25 minutes early

### Scenario 2: High-Stakes Exam
- Reporting Time: 10:00
- Buffer: 45 minutes
- Deadline: 09:15
- Stricter requirements for important exams

### Scenario 3: Back-to-Back Exams
- First exam reporting: 09:00, deadline: 08:30
- Second exam reporting: 10:30, deadline: 10:00
- 30-minute break between exams

## FAQs

**Q: Can I change the buffer for an existing duty?**
A: Yes, edit the duty in Admin panel and change the "Deadline Buffer" field.

**Q: What if an instructor can't arrive by the deadline?**
A: They're still marked "late" but their arrival is recorded. Admin can see they showed up, just after deadline.

**Q: Is the deadline per duty or per instructor?**
A: Per duty. Different duties can have different buffers.

**Q: What timezone does the system use?**
A: Your browser's local timezone. Reporting time is always in local time.

**Q: Can instructors mark arrival early?**
A: No, button only appears starting 10 minutes before reporting time.

---

**Last Updated:** November 23, 2025
