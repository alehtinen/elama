# Content.md Formatting Guide

This guide shows all possible formatting options for content.md file.

## File Structure

```markdown
# Content Data

## Main Tags
mainTagId: Finnish Name | English Name | color | 

## Types
typeId: Finnish Name | English Name

## Tags
tagId: Finnish Name | English Name | color | icon-url (optional)

## Icons
- You can add custom icons/images to tags by adding the image URL after the color
- Example: `työ: Työ | Work | blue | https://example.com/work-icon.svg`
- Icons will be displayed next to tag names in the UI

# Content

## Category Header (Optional - organizational only, parser skips these)

### Item Title FI | Item Title EN
Type: link
Main Tag: mainTagId, mainTagId2
Tags: tag1, tag2, tag3
Icon: https://example.com/icon.svg (optional - custom icon for this item)
URL: https://example.com (optional)
URL Name: Custom link text (optional)
URL Description: Description for the main URL (optional)
Contact: true (optional - marks main URL as contact link)
URL Contact: https://contact.example.com (optional - separate contact URL)
Description FI: Finnish description
Description EN: English description
Added: 27.01.2026 (optional)
Updated: 27.01.2026 (optional)
Last Checked: 27.01.2026 (optional)
PDF: true (optional - enables PDF download for this item)
Body FI: Finnish body content with markdown (optional)

**Bold text**

Regular paragraph.

Numbered list:
1. First item
2. Second item
3. Third item

Bullet list:
- Item one
- Item two
- Item three

#### Heading level 4
##### Heading level 5
###### Heading level 6

>[!info] Information callout title

Callout content here

>[!note] Note callout

Note content

>[!tip] Tip callout

Helpful tip

>[!quote] Quote callout

Citation text

>[!warning] Warning callout

Warning message

>[!success] Success callout

Success message

>[!danger] Danger callout

Danger warning

>[!question] Question callout

Question text

Body EN: English body content (optional)

Same formatting options as Finnish body.

#### Links: Section Title FI | Section Title EN (optional)
- Name: Link Name FI | Link Name EN
  URL: https://example.com (optional if URL FI and URL EN exist)
  URL FI: https://fi.example.com (optional)
  URL EN: https://en.example.com (optional)
  Description: Universal description (optional)
  Description FI: Finnish description (optional)
  Description EN: English description (optional)
  Contact: true (optional - marks this link as contact)
  URL Contact: https://contact.example.com (optional - separate contact URL for this link)

- Name: Another Link
  URL: https://another.com
  Description: Another link description

#### Links: Contact Section | Contact Information (optional)
- Name: Contact Name
  URL: https://contact.example.com
  Description: Contact description

#### Lähteet: Lähteet | Sources (optional - for citations and references)
- Name: Source Name FI | Source Name EN
  URL: https://source.example.com (optional)
  Author: Author Name (optional)
  Date: Publication date (optional)
  Retrieved: Retrieval date DD.MM.YYYY (optional)
  Pages: Page numbers, e.g. pp. 45-67 (optional)
  Description FI: Finnish description (optional)
  Description EN: English description (optional)

- Name: Book Reference
  Author: Author Name
  Date: 2025
  Pages: pp. 123-145
  Description: Reference description
```

## Complete Example

```markdown
# Content Data

## Main Tags
työttömyys: Työttömyys | Unemployment | red | 
tampere: Tampere | Tampere | orange

## Types
link: Linkki | Link
tip: Vinkki | Tip

## Tags
työ: Työ | Work | blue | https://example.com/icons/work.svg
tampere-alue: Tampere | Tampere | red
tuki: Tuki | Support | emerald

# Content

## Työttömyys

### TE-palvelut | TE-Services
Type: link
Main Tag: työttömyys
Tags: työ, tuki
Icon: https://example.com/te-services-icon.svg
URL: https://www.te-palvelut.fi/
Description FI: Työnhakijan palvelut verkossa
Description EN: Job seeker services online
Added: 27.01.2026
Last Checked: 27.01.2026
Updated: 27.01.2026
PDF: true
Body FI: TE-palvelut tarjoaa kattavat palvelut työnhakijoille.

**Tärkeää:**
- Rekisteröidy työnhakijaksi
- Päivitä tietosi säännöllisesti
- Käytä työnhakupalveluita

>[!tip] Vinkki työnhakuun

Aseta hakuvahti sähköpostiin niin saat tiedon uusista työpaikoista.

#### Ohjeet

1. Kirjaudu palveluun
2. Täytä profiilisi
3. Aloita työpaikan haku

Body EN: TE-services provides comprehensive services for job seekers.

**Important:**
- Register as job seeker
- Update information regularly
- Use job search services

>[!tip] Job search tip

Set up email alerts to get notified about new job openings.

#### Instructions

1. Log in to service
2. Fill your profile
3. Start job search

#### Links: Palvelut | Services
- Name: Työnhakijalle | For jobseekers
  URL FI: https://www.te-palvelut.fi/tyonhakijalle
  URL EN: https://www.te-palvelut.fi/en/jobseekers
  Description FI: Palvelut työnhakijoille
  Description EN: Services for jobseekers

- Name: Avoimet työpaikat | Open positions
  URL: https://tyomarkkinatori.fi/
  Description: Työpaikkailmoitukset

#### Links: Yhteystiedot | Contact Information
- Name: Asiakaspalvelu | Customer Service
  URL: https://www.te-palvelut.fi/yhteystiedot
  Description: Ota yhteyttä

#### Lähteet: Lähteet | Sources
- Name: TE-palveluiden käsikirja | TE-Services Handbook
  URL: https://www.te-palvelut.fi/handbook
  Author: TE-palvelut
  Date: 2025
  Retrieved: 27.01.2026
  Pages: pp. 12-15
  Description FI: Virallinen ohjeistus työnhakijoille
  Description EN: Official guidance for job seekers

- Name: Työllisyyslaki
  Author: Eduskunta
  Date: 2024
  Pages: Luku 3, §12
```

## Field Reference

### Required Fields
- `Type:` - link or tip
- `Main Tag:` - one of the defined main tags
- `Tags:` - comma-separated list of tags
- `Description FI:` - Finnish description
- `Description EN:` - English description

### Optional Fields
- `Icon:` - URL to custom icon/image for this item
- `URL:` - main link
- `URL Name:` - custom text for main link
- `URL Description:` - description for main URL
- `Contact:` - true/false (marks main URL as contact)
- `URL Contact:` - separate contact URL
- `Added:` - date in DD.MM.YYYY format
- `Updated:` - date in DD.MM.YYYY format
- `Last Checked:` - date in DD.MM.YYYY format
- `PDF:` - true (enables PDF download)
- `Body FI:` - markdown content in Finnish
- `Body EN:` - markdown content in English
- `#### Links:` sections with links
- `#### Lähteet:` sources/citations section

### Link Fields (for #### Links: sections)
- `Name:` - required, bilingual with | separator
- `URL:` - optional if URL FI and URL EN exist
- `URL FI:` - optional, Finnish-specific URL
- `URL EN:` - optional, English-specific URL
- `Description:` - optional, universal description
- `Description FI:` - optional, Finnish description
- `Description EN:` - optional, English description
- `Contact:` - optional, true marks as contact link
- `URL Contact:` - optional, separate contact URL

### Source Fields (for #### Lähteet: sections)
- `Name:` - required, bilingual with | separator
- `URL:` - optional, link to source
- `Author:` - optional, author name
- `Date:` - optional, publication date/year
- `Retrieved:` - optional, retrieval date (DD.MM.YYYY)
- `Pages:` - optional, page numbers or section reference
- `Description:` - optional, universal description
- `Description FI:` - optional, Finnish description
- `Description EN:` - optional, English description

## Obsidian Callout Types

Available callout types:
- `>[!info]` - Blue information box
- `>[!note]` - Cyan note box
- `>[!tip]` - Green tip box
- `>[!quote]` - Gray quote box
- `>[!warning]` - Yellow warning box
- `>[!success]` - Green success box
- `>[!danger]` - Red danger box
- `>[!error]` - Red error box
- `>[!question]` - Purple question box
- `>[!bug]` - Red bug box
- `>[!example]` - Purple example box
- `>[!important]` - Orange important box

Format:
```markdown
>[!type] Title text

Content on next line after blank line
```

## Notes

- Category headers (##) are optional and organizational only
- Content items always use ### (three hashes)
- Link sections always use #### (four hashes)
- Body content supports markdown: **bold**, lists, headings (####, #####, ######)
- Emojis in link section titles are automatically removed by the parser
- Indentation matters - don't add extra spaces before #### Links:
