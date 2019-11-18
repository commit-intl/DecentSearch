[← back](./)

# Type: Contact

Object that descripes an entry in the contact list of a DecentSearch server.

## Definition

- [object] *optional*
  Attributes:
  - **url** [[URL]](./types/url) 
  - **version** [string] 
  - **identity** [[PEM]](./types/pem) 
  - **hashRangeUrl** [[HashRange]](./types/hashrange) 
  - **hashRangeData** [[HashRange]](./types/hashrange) 
  - **reports** [array] *optional*
    Rules:
       - min: `0`
       - max: `100`

    Item Types:
    - [[Report]](./types/report) *optional*



---
Interested to contribute? [contact me](mailto:dustin@commit.international)
