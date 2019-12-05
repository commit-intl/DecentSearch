[← back](./)

# Type: SearchQuery

Object that descripes a search query.

## Definition

- [object] *optional*
  Attributes:
  - **query** [array] 
    Item Types:
    - [object] *optional*
      Attributes:
      - **value** [string] 
      - **type** [string] *optional*
        Rules:
           - allow: `*,title,content,author,date`
           - default: `*`

  - **ttl** [number] 
    Rules:
       - max: `9`
       - min: `0`




---
Interested to contribute? [contact me](mailto:dustin@commit.international)
