<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@archivator/archivable](./archivable.md) &gt;
[ArchivableOrderedInputUrlTruncateTuplesFirstLine](./archivable.archivableorderedinputurltruncatetuplesfirstline.md)

## ArchivableOrderedInputUrlTruncateTuplesFirstLine variable

The first line of the archive index CSV file

1. First item is a fully qualified source document URL (i.e. a Web Page's
   address) 2. \_selector\_, A CSS selector where the main content is 3.
   \_truncate\_, A list of CSS selectors to strip off (e.g. ads, orthogonal
   content)

This is the shape of data input we can use for iteration.

<b>Signature:</b>

```typescript
ArchivableOrderedInputUrlTruncateTuplesFirstLine =
  '"Web Page URL";"CSS Selectors for main content";"CSS Selectors to strip content off"'
```