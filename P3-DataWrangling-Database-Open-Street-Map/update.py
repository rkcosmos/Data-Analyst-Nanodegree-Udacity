import xml.etree.cElementTree as ET

# mapping for abbreviation at the end of words
mapping1 = {"St": "Street",
            "St.": "Street",
            "Rd.": "Road",
            "Rd": "Road",
            "Ave": "Avenue",
            "Ave.": "Avenue"
            }

# mapping for transliteration: Thai word is usually at the first element while English translation has to be added at the end
mapping2 = {"thanon": "Road",
            "Thanon": "Road",
            "Wat": "Temple"
            }

def is_street_name(elem):
    return (elem.attrib['k'] == "addr:street")

def update_name(word_in, mapping1, mapping2):
    name_list = word_in.replace(')','').replace(' (',';').replace('(',';').split(';')
    for i, name in enumerate(name_list):
        parts = name.split(' ')
        if parts[-1] in mapping1:
            parts[-1] = mapping1[parts[-1]]
        if parts[0] in mapping2:
            parts.append(mapping2[parts[0]])
            parts.pop(0)
        name_list[i] = " ".join(parts)
        if i != 0:
            name_list[i] += ')'
    word_out = " (".join(name_list)
    return word_out

def audit(osmfile):
    osm_file = open(osmfile, "r")

    for event, elem in ET.iterparse(osm_file, events=("start",)):
        if elem.tag == "way":
            for tag in elem.iter("tag"):
                if is_street_name(tag):
                    print update_name(tag.attrib['v'], mapping1, mapping2)
                    tag.attrib['v'] = update_name(tag.attrib['v'], mapping1, mapping2)
                    print tag.attrib['v']
    tree.write('sample2.osm')
    osm_file.close()



print update_name("thanon esan (yes Rd) (Thanon ok)",mapping1,mapping2)

audit("sample.osm")
