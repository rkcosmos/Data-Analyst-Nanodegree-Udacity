# Open Street Map:
### Case study for data wrangling and SQL database

**By:** Rakpong Kittinaradorn

**Date:** 18 November 2016


## Map area

Bangkok, Thailand

https://mapzen.com/data/metro-extracts/metro/bangkok_thailand/

## List of Files

> * slice.py: sample data to managable size

> * sample.osm: sample data

> * parse.py: count number of each tags

> * way_tag_unique_k.py: examine unique 'k' tag in way element

> * investigate_tag.py: investigate pattern in 'k' tag

> * user.py: count the number of users

> * update.py


## Problems Encountered in Map Data

The whole dataset is large (~360 Mb), so I sample it for preliminary exploration. After running parse.py, way_tag_unique_k.py, investigate_tag.py and looking into sample.osm, I found 3 main problems needed to be addressed before import it into the database.

* Inconsistent translation and transliteration from Thai to English (ex. Temple vs. Wat (transliteration of Temple (วัด)).

* Street name appears in multiple syntaxes.

* Abbreviated street name (ex. Rd. for Road).

#### Inconsistent translation and transliteration

Thai words are usually translated into English but some entries has its transliteration instead. The example are the word “Wat (วัด)” which can be translated into “Temple” and “Thanon (ถนน)” can be translated into “Road”.  The update code is as follows.

```python

add update code


```

Note that transliteration word is usually a prefix while translated word is a suffix, i.e. Thanon Sukhumvit is mapped to Sukhumvit Road.


#### Street name appears in multiple syntaxes

Street name appears in two different format. The first one is in parent element ‘node’. Street name is in its child element “tag” with attribute ‘k’ = ‘addr:street’.

```
<node … >
		<tag k="name" v="Elle Tha Pra Chan" />
		<tag k="amenity" v="restaurant" />
		<tag k="cuisine" v="thai" />
		<tag k="addr:street" v="Thanon Maharat" />
		<tag k="addr:housenumber" v="172" />
</node>
```
The second one is in parent element ‘way’. When it has child element ‘tag’ with ‘k’ = ‘highway’ and another one with ‘k’ = ‘name:en’. The street name is in the one with ‘k’ = ‘name:en’.
```
<way … >
	<nd ref="249643562" />
	…
	<nd ref="249643519" />
	<tag k="name" v="ถนน ราชดำเนิน" />
	<tag k="highway" v="residential" />
	<tag k="name:en" v="Thanon Rachchadamnern" />
	<tag k="name:th" v="ถนน ราชดำเนิน" />
</way>
```

In cleaning street name, I need to take into account both formats.


#### Abbreviated street name

Some street names use abbreviation form (ex. Rd.) while most of them is in its full form (ex. Road). I list all abbreviation by running audit.py and wrote a script to map all abbreviated one to its full format.

## Data Exploration using SQL queries

```
>sqlite3 test.db
sqlite>.mode csv [table name]
sqlite>.import [file name] [table name]
```

After data cleaning, I use add file to print a json file and import it into sql database. Following are the explorations of this dataset by SQL queries.


number of node, way

number of user

detail on user


number of entries group by postcode/cities


amenities

religion

cuisine

type of highway


## Conclusion














how many relationship, way, node
{'node': 33581, 'nd': 39734, 'member': 264, 'tag': 10872, 'relation': 20, 'way': 4528, 'osm': 1}

from investigate way file
{'lower': 9942, 'lower_colon': 906, 'other': 24, 'problemchars': 0}

examples of “other” are [seamark:light:range, fuel:octane_91, name:th-Latn]
