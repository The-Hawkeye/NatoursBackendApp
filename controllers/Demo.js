/*1. Accept any GitHub username and save details from the GitHub API into the database. If
a user’s data is already available in the database, do not call the GitHub API again.
2. For a given user, find all the users where users mutually follow each other and save
them as friends. Eg: UserA ->; Follows UserB, UserC, UserD; UserA follows back by
UserB, UserC. So, UserB and UserC would be friends of UserA
3. Search the saved data from the database based on username, location etc.
4. Soft delete a record based on a given username from the database.
5. Update fields like “location”, “blog”, “bio” etc for a given user in the database.
6. Return list of all users from the database sorted by given fields like “public_repos”,
“public_gists”, “followers”, “following”, “created_at” etc.
*/