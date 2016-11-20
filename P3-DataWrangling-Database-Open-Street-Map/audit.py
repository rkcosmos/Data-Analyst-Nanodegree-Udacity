import xml.etree.cElementTree as ET
from collections import defaultdict
import re
import pprint

street_type_re = re.compile(r'\b\S+\.?$', re.IGNORECASE)
postcode_re = re.compile(r'^[0-9]{5}$')

expected = ["Street", "Avenue", "Boulevard", "Drive", "Court", "Place", "Square", "Lane", "Road",
            "Trail", "Parkway", "Commons", "Bridge", "Expressway", "Motorway"]

# UPDATE THIS VARIABLE
mapping = { "St": "Street",
            "St.": "Street",
            "Rd.": "Road",
            "Ave": "Avenue"
            }

def audit_street_type(street_types, street_name):
    m = street_type_re.search(street_name)
    if m:
        street_type = m.group()
        if street_type not in expected:
            street_types[street_type].add(street_name)

def is_street_name1(elem):
    return (elem.attrib['k'] == "addr:street")

def is_street_name2(elem):
    return (elem.attrib['k'] == "highway")

def is_postcode(elem):
    return (elem.attrib['k'] == "addr:postcode")

def audit(osmfile):
    osm_file = open(osmfile, "r")
    street_types1 = defaultdict(set)
    street_types2 = defaultdict(set)
    for event, elem in ET.iterparse(osm_file, events=("start",)):
        if elem.tag == "node" or elem.tag == "way":
            street2 = False
            for tag in elem.iter("tag"):
                if is_street_name1(tag):
                    audit_street_type(street_types1, tag.attrib['v'])
                if is_street_name2(tag):
                    street2 = True
                if (tag.attrib['k'] == "name:en" and street2):
                    audit_street_type(street_types2, tag.attrib['v'])
                if is_postcode(tag):
                    if not postcode_re.match(tag.attrib['v']):
                        print tag.attrib['v']

    osm_file.close()
    return [street_types1, street_types2]

st_types = audit("bangkok_thailand.osm")[0]
pprint.pprint(dict(st_types))
