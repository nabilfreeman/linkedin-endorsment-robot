# Linkedin Endorsment Robot
Automatically endorse your colleagues and boss on LinkedIn! 🙉

# Disclaimer
- This was not my idea
- I have never used this on my LinkedIn account 😏
- The code for this is very, very bad
- You might get banned if you use this more than once per week

# History
I wrote this in a couple of hours when I was bored.

It is super hacky, but my friends have told me that IT WORKS! This is a sure way to get your next promotion.

The way it works...
- Gather a list of your LinkedIn contacts (only on 1st run)
- Go to each LinkedIn contacts' profile, and endorse their highest rated skill (the first in the list).
  - If you've already endorsed their number one skill, the robot will endorse the next highest. Repeat until there's nothing left.

# Usage
In `main.js`, replace `[[LINKEDIN_USER_HERE]]` and `[[LINKEDIN_PASS_HERE]]` with your details. Be careful not to commit them to Github or anywhere else.



    ./bin/phantomjs main.js
(wow so easy)

# Bugs
- Premium accounts cause the app to crash for some unknown reason. You need to remove them manually from `names.json`.

# Limitations
- LinkedIn ignores any endorsements you make after you've done more than like 150 in 24 hours. I've heard that spacing your sessions out and manually splitting `names.json` into smaller chunks works really well. If you have less than 150 contacts, then great! No worries!
