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
    - min: undefined    
- max: undefined    
- default: undefined
- **p** [number] *optional*
  > page

  Rules:
    - min: undefined    
- default: undefined



## Response

- [object] *optional*
  Attributes:
  - **ok** [boolean] 
  - **p** [number] 
    > page

    Rules:
      - min: undefined
  - **pp** [number] 
    > entries per page

    Rules:
      - min: undefined
  - **result** [array] 
    > contacts as array, will be as long as 'pp'

    Rules:
      - min: undefined      
- max: undefined
    Item Types:
    - [[Contact]](./types/contact) 



---
Interested to contribute? [contact me](mailto:dustin@commit.international)
