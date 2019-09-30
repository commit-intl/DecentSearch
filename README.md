<p align="center">
  <img src="/docs/images/logo.svg" alt="Decent Search Logo" />
</p>
<p align="center">
  <b>a decentralized search engine server standard</b>
</p>
  
<p align="center">
DecentSearch will consists of a network of independent servers. Each contributing its own index data to the network and hosting portions of others. None of these server have to run the same code, just implement the same API.
</p>

```diff
- Disclaimer: This project is still work in progress anything written here, 
- may and propably will change in the course of the next months. 
```

# How does it work?

It works by a ruleset that governs indexing, index distributen, discovery, search and security between all participating nodes.

- [Indexing](#indexing)
- Distribution [TBD]
- Discovery [TBD]
- [Search](#search)
- Security [TBD]

## Indexing

The server will be given URLs to index. Their content is cleaned from any format syntax eg. HTML-Tags. The cleaned content is split into words. Each word is saved in a reverse index pointing to the source file. Additionally metadata for each file is saved. Each server manages its local search index and search parameters.


## Search
<p>
  <img align="right" width="50%" src="/docs/images/client-search.svg" alt="client search visualization"/>
  The user will access the search through a website that will send the request to a DecentSearch server. That server will then search through it's internal and external index and in parallel will send a search request for each word to known, trusted servers that are expected to have a result for that word.
  <br clear="both">
</p>
<br clear="both">
<p>
  <img align="left" width="50%" src="/docs/images/search-internal.svg" alt="client search visualization"/>
  The internal index is searched for matching words, the resulting URLs are ranked by the amount of contained words.
  <br clear="both">
</p>
<br clear="both">
<p>
  <img align="left" width="50%" src="/docs/images/search-external.svg" alt="client search visualization"/>
  In the external index only words with a hash that is within its hash range, are searched. The words then are requested from servers that are known to have a hash range that matches that particular word.
  <br clear="both">
</p>

---
Interested to contribute? [contact me](mailto:dustin@commit.international)
