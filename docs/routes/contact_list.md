[← back](./)

# Route: Contact List

| Method | Path |
|---|---| 
| GET | /contact-list |

Returns the hosts own contact data.


## Request

### Query
- **pp** [number] *optional*
  > entries per page

  Rules:
    - min: `1`    
- max: `1000`    
- default: `100`
- **p** [number] *optional*
  > page

  Rules:
    - min: `0`    
- default: `0`



## Response

- [object] *optional*
  Attributes:
  - **ok** [boolean] 
  - **p** [number] 
    > page

    Rules:
      - min: `0`
  - **pp** [number] 
    > entries per page

    Rules:
      - min: `0`
  - **result** [array] 
    > contacts as array, will be as long as 'pp'

    Rules:
      - min: `0`      
- max: `1000`
    Item Types:
    - [[Contact]](./types/contact) 



---
Interested to contribute? [contact me](mailto:dustin@commit.international)
