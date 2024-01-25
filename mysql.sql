CREATE TABLE family_members(
	id SERIAL NOT NULL UNIQUE PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	color VARCHAR(255)
); 

CREATE TABLE visited_countries(
	id INTEGER NOT NULL REFERENCES family_members(id),
	country_code VARCHAR(2) NOT NULL
); 

--to get the join relation--
SELECT visited_countries.country_code FROM family_members JOIN visited_countries ON family_members.id = visited_countries.id;