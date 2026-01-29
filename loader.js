// Content loader - parses content-source.md and generates contentData
// This script fetches the markdown file and converts it to the data structure

async function loadContentFromMarkdown() {
    try {
        const response = await fetch('content.md');
        const markdown = await response.text();
        
        return parseMarkdownContent(markdown);
    } catch (error) {
        console.error('Error loading content:', error);
        return { content: [], mainTagDefinitions: {}, tagDefinitions: {} };
    }
}

function parseMarkdownContent(markdown) {
    const lines = markdown.split('\n');
    const mainTagDefinitions = {};
    const typeDefinitions = {};
    const tagDefinitions = {};
    const content = [];
    
    let currentSection = null;
    let currentItem = null;
    let itemId = 0;
    let currentBodyField = null; // Track if we're reading a multi-line body
    let isInLinkSection = false; // Track if we're in a #### Links: section
    let currentLinkSection = null; // Current link section being built (with title and links)
    let currentLinkItem = null; // Current link item being built
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        // Check if this is a new field (starts with a known field name)
        // Note: Use '### ' to match only level-3 headers, not level-4 (####)
        const isNewField = trimmedLine.startsWith('### ') || 
                          trimmedLine.startsWith('#### Links:') || // Stop body reading when link section starts
                          trimmedLine.startsWith('URL:') ||
                          trimmedLine.startsWith('Type:') ||
                          trimmedLine.startsWith('Main Tag:') ||
                          trimmedLine.startsWith('Tags:') ||
                          trimmedLine.startsWith('Links:') ||
                          trimmedLine.startsWith('Links FI:') ||
                          trimmedLine.startsWith('Links EN:') ||
                          trimmedLine.startsWith('Description FI:') ||
                          trimmedLine.startsWith('Description EN:') ||
                          trimmedLine.startsWith('Description (fi):') ||
                          trimmedLine.startsWith('Description (en):') ||
                          trimmedLine.startsWith('Body FI:') ||
                          trimmedLine.startsWith('Body EN:') ||
                          trimmedLine.startsWith('Added:') ||
                          trimmedLine.startsWith('Updated:');
        
        // If we're reading a body field and encounter a new field or empty line followed by field, end body reading
        if (currentBodyField && isNewField) {
            currentBodyField = null;
        }
        
        // Continue reading body content
        if (currentBodyField && !isNewField) {
            if (!currentItem.body) currentItem.body = { fi: '', en: '' };
            if (currentItem.body[currentBodyField]) {
                currentItem.body[currentBodyField] += '\n' + line;
            }
            continue;
        }
        
        // Skip empty lines (except when in body)
        if (!trimmedLine) continue;
        
        // Section headers
        if (trimmedLine === '## Main Tags') {
            currentSection = 'mainTags';
            continue;
        } else if (trimmedLine === '## Types') {
            currentSection = 'types';
            continue;
        } else if (trimmedLine === '## Tags') {
            currentSection = 'tags';
            continue;
        } else if (trimmedLine === '## Content') {
            currentSection = 'content';
            continue;
        }
        
        // Parse main tags
        if (currentSection === 'mainTags' && !trimmedLine.startsWith('#')) {
            // Format: mainTagId: FinnishLabel | EnglishLabel | color | image (optional)
            const parts = trimmedLine.split(':');
            if (parts.length === 2) {
                const mainTagId = parts[0].trim();
                const rest = parts[1].trim().split('|');
                if (rest.length >= 3) {
                    mainTagDefinitions[mainTagId] = {
                        fi: rest[0].trim(),
                        en: rest[1].trim(),
                        color: rest[2].trim(),
                        image: rest.length > 3 ? rest[3].trim() : ''
                    };
                }
            }
        }
        
        // Parse types
        if (currentSection === 'types' && !trimmedLine.startsWith('#')) {
            // Format: typeId: FinnishLabel | EnglishLabel
            const parts = trimmedLine.split(':');
            if (parts.length === 2) {
                const typeId = parts[0].trim();
                const rest = parts[1].trim().split('|');
                if (rest.length >= 2) {
                    typeDefinitions[typeId] = {
                        fi: rest[0].trim(),
                        en: rest[1].trim()
                    };
                }
            }
        }
        
        // Parse tags
        if (currentSection === 'tags' && !trimmedLine.startsWith('#')) {
            // Format: tagId: FinnishLabel | EnglishLabel | color
            const parts = trimmedLine.split(':');
            if (parts.length === 2) {
                const tagId = parts[0].trim();
                const rest = parts[1].trim().split('|');
                if (rest.length === 3) {
                    tagDefinitions[tagId] = {
                        fi: rest[0].trim(),
                        en: rest[1].trim(),
                        color: rest[2].trim()
                    };
                }
            }
        }
        
        // Parse Content items
        if (currentSection === 'content' && trimmedLine.startsWith('### ')) {
            // Save the last link item if we were in a link section
            if (currentLinkItem && currentLinkSection) {
                currentLinkSection.links.push(currentLinkItem);
                currentLinkItem = null;
            }
            // Save the last link section if exists
            if (currentLinkSection) {
                if (!currentItem.linkSections) currentItem.linkSections = [];
                currentItem.linkSections.push(currentLinkSection);
                currentLinkSection = null;
            }
            isInLinkSection = false;
            
            // Save previous item if exists
            if (currentItem) {
                content.push(currentItem);
            }
            
            currentBodyField = null; // Reset body field when starting new item
            
            // Start new item
            // Format: ### FinnishTitle | EnglishTitle
            const titleParts = trimmedLine.substring(4).split('|');
            itemId++;
            currentItem = {
                id: itemId,
                title: {
                    fi: titleParts[0].trim(),
                    en: titleParts[1] ? titleParts[1].trim() : titleParts[0].trim()
                },
                description: { fi: '', en: '' },
                mainTag: '',
                tags: [],
                added: ''
            };
        }
        
        // Parse item properties
        if (currentItem) {
            // Check for new YAML-style link sections
            if (trimmedLine.startsWith('#### Links:')) {
                // Save previous link item to previous section
                if (currentLinkItem && currentLinkSection) {
                    currentLinkSection.links.push(currentLinkItem);
                    currentLinkItem = null;
                }
                // Save previous link section if exists
                if (currentLinkSection) {
                    if (!currentItem.linkSections) currentItem.linkSections = [];
                    currentItem.linkSections.push(currentLinkSection);
                }
                // New YAML format: #### Links: Title FI | Title EN
                const titlePart = trimmedLine.substring(12).trim(); // After '#### Links:'
                const titleParts = titlePart.split('|');
                currentLinkSection = {
                    title: {
                        fi: titleParts[0] ? titleParts[0].trim() : 'Lisätietoa',
                        en: titleParts[1] ? titleParts[1].trim() : 'More info'
                    },
                    links: []
                };
                isInLinkSection = true;
                currentLinkItem = null;
                continue;
            } else if (isInLinkSection && (trimmedLine.startsWith('###') || trimmedLine.startsWith('##'))) {
                // Exit link section when we hit another header
                if (currentLinkItem && currentLinkSection) {
                    currentLinkSection.links.push(currentLinkItem);
                    currentLinkItem = null;
                }
                if (currentLinkSection) {
                    if (!currentItem.linkSections) currentItem.linkSections = [];
                    currentItem.linkSections.push(currentLinkSection);
                    currentLinkSection = null;
                }
                isInLinkSection = false;
                currentLinkItem = null;
            } else if (isInLinkSection) {
                // Parse YAML-style link items
                if (trimmedLine.startsWith('- Name:')) {
                    // Save previous link item if exists
                    if (currentLinkItem && currentLinkSection) {
                        currentLinkSection.links.push(currentLinkItem);
                    }
                    // Start new link item
                    const namePart = trimmedLine.substring(7).trim();
                    const nameParts = namePart.split('|');
                    currentLinkItem = {
                        name: {
                            fi: nameParts[0] ? nameParts[0].trim() : '',
                            en: nameParts[1] ? nameParts[1].trim() : nameParts[0] ? nameParts[0].trim() : ''
                        }
                    };
                } else if (currentLinkItem) {
                    // Parse link item properties
                    if (trimmedLine.startsWith('URL FI:')) {
                        if (!currentLinkItem.url) currentLinkItem.url = { fi: '', en: '' };
                        currentLinkItem.url.fi = trimmedLine.substring(7).trim();
                    } else if (trimmedLine.startsWith('URL EN:')) {
                        if (!currentLinkItem.url) currentLinkItem.url = { fi: '', en: '' };
                        currentLinkItem.url.en = trimmedLine.substring(7).trim();
                    } else if (trimmedLine.startsWith('URL Contact:')) {
                        // Contact URL for this specific link item
                        const url = trimmedLine.substring(12).trim();
                        currentLinkItem.urlContact = url;
                    } else if (trimmedLine.startsWith('URL:')) {
                        // Universal URL (same for both languages)
                        const url = trimmedLine.substring(4).trim();
                        currentLinkItem.url = { fi: url, en: url };
                    } else if (trimmedLine.startsWith('Contact:')) {
                        // Contact flag for this specific link item
                        const contactValue = trimmedLine.substring(8).trim().toLowerCase();
                        currentLinkItem.isContact = contactValue === 'true' || contactValue === 'yes';
                    } else if (trimmedLine.startsWith('Description FI:')) {
                        if (!currentLinkItem.description) currentLinkItem.description = { fi: '', en: '' };
                        currentLinkItem.description.fi = trimmedLine.substring(15).trim();
                    } else if (trimmedLine.startsWith('Description EN:')) {
                        if (!currentLinkItem.description) currentLinkItem.description = { fi: '', en: '' };
                        currentLinkItem.description.en = trimmedLine.substring(15).trim();
                    } else if (trimmedLine.startsWith('Description:')) {
                        // Universal description (same for both languages)
                        const desc = trimmedLine.substring(12).trim();
                        currentLinkItem.description = { fi: desc, en: desc };
                    }
                }
            } else if (trimmedLine.startsWith('URL: ')) {
                currentItem.url = trimmedLine.substring(5).trim();
            } else if (trimmedLine.startsWith('URL Name: ')) {
                // URL Name with language support: URL Name: Suomeksi | English
                const namePart = trimmedLine.substring(10).trim();
                const nameParts = namePart.split('|');
                if (!currentItem.urlName) currentItem.urlName = { fi: '', en: '' };
                currentItem.urlName.fi = nameParts[0] ? nameParts[0].trim() : '';
                currentItem.urlName.en = nameParts[1] ? nameParts[1].trim() : nameParts[0] ? nameParts[0].trim() : '';
            } else if (trimmedLine.startsWith('URL Description: ')) {
                // URL Description with language support: URL Description: Kuvaus | Description
                const descPart = trimmedLine.substring(17).trim();
                const descParts = descPart.split('|');
                if (!currentItem.urlDescription) currentItem.urlDescription = { fi: '', en: '' };
                currentItem.urlDescription.fi = descParts[0] ? descParts[0].trim() : '';
                currentItem.urlDescription.en = descParts[1] ? descParts[1].trim() : descParts[0] ? descParts[0].trim() : '';
            } else if (trimmedLine.startsWith('URL Contact: ')) {
                // Contact URL - separate URL for contact information
                currentItem.urlContact = trimmedLine.substring(13).trim();
            } else if (trimmedLine.startsWith('Contact: ')) {
                // Contact flag - indicates if main URL is a contact link
                const contactValue = trimmedLine.substring(9).trim().toLowerCase();
                currentItem.isContactUrl = contactValue === 'true' || contactValue === 'yes';
            } else if (trimmedLine.startsWith('Icon: ')) {
                currentItem.icon = trimmedLine.substring(6).trim();
            } else if (trimmedLine.startsWith('Type: ')) {
                currentItem.type = trimmedLine.substring(6).trim();
            } else if (trimmedLine.startsWith('Main Tag: ')) {
                const mainTagValue = trimmedLine.substring(10).trim();
                // Support multiple main tags separated by commas
                if (mainTagValue.includes(',')) {
                    currentItem.mainTags = mainTagValue.split(',').map(t => t.trim());
                    currentItem.mainTag = currentItem.mainTags[0]; // Backward compatibility
                } else {
                    currentItem.mainTag = mainTagValue;
                }
            } else if (trimmedLine.startsWith('Tags: ')) {
                const tagList = trimmedLine.substring(6).trim();
                currentItem.tags = tagList.split(',').map(t => t.trim());
            } else if (trimmedLine.startsWith('Links: ')) {
                // Old pipe-delimited format (backward compatibility)
                const linkList = trimmedLine.substring(7).trim();
                if (!currentItem.links) currentItem.links = [];
                currentItem.links = parseLinkList(linkList);
            } else if (trimmedLine.startsWith('Links FI: ')) {
                // Old pipe-delimited format (backward compatibility)
                const linkList = trimmedLine.substring(10).trim();
                if (!currentItem.linksFI) currentItem.linksFI = [];
                currentItem.linksFI = parseLinkList(linkList);
            } else if (trimmedLine.startsWith('Links EN: ')) {
                // Old pipe-delimited format (backward compatibility)
                const linkList = trimmedLine.substring(10).trim();
                if (!currentItem.linksEN) currentItem.linksEN = [];
                currentItem.linksEN = parseLinkList(linkList);
            } else if (trimmedLine.startsWith('Added: ')) {
                currentItem.added = trimmedLine.substring(7).trim();
            } else if (trimmedLine.startsWith('Updated: ')) {
                currentItem.updated = trimmedLine.substring(9).trim();
            } else if (trimmedLine.startsWith('Last Checked: ')) {
                currentItem.lastChecked = trimmedLine.substring(14).trim();
            } else if (trimmedLine.startsWith('PDF: ')) {
                const pdfValue = trimmedLine.substring(5).trim().toLowerCase();
                currentItem.downloadablePDF = pdfValue === 'true' || pdfValue === 'yes';
            } else if (trimmedLine.startsWith('Description FI: ') || trimmedLine.startsWith('Description (fi): ')) {
                currentItem.description.fi = trimmedLine.includes('(fi)') ? trimmedLine.substring(18).trim() : trimmedLine.substring(16).trim();
            } else if (trimmedLine.startsWith('Description EN: ') || trimmedLine.startsWith('Description (en): ')) {
                currentItem.description.en = trimmedLine.includes('(en)') ? trimmedLine.substring(18).trim() : trimmedLine.substring(16).trim();
            } else if (trimmedLine.startsWith('Body FI: ')) {
                if (!currentItem.body) currentItem.body = { fi: '', en: '' };
                currentItem.body.fi = trimmedLine.substring(9).trim();
                currentBodyField = 'fi'; // Start reading multi-line body
            } else if (trimmedLine.startsWith('Body EN: ')) {
                if (!currentItem.body) currentItem.body = { fi: '', en: '' };
                currentItem.body.en = trimmedLine.substring(9).trim();
                currentBodyField = 'en'; // Start reading multi-line body
            }
        }
    }
    
    // Add last link item to section if exists
    if (currentLinkItem && currentLinkSection) {
        currentLinkSection.links.push(currentLinkItem);
    }
    // Add last link section if exists
    if (currentLinkSection && currentItem) {
        if (!currentItem.linkSections) currentItem.linkSections = [];
        currentItem.linkSections.push(currentLinkSection);
    }
    
    // Add last item
    if (currentItem) {
        content.push(currentItem);
    }
    
    return { content, mainTagDefinitions, typeDefinitions, tagDefinitions };
}

// Parse link list - format: URL | Name | Description
function parseLinkList(linkString) {
    return linkString.split(',').map(linkItem => {
        const parts = linkItem.trim().split('|');
        if (parts.length === 3) {
            return {
                url: parts[0].trim(),
                name: parts[1].trim(),
                description: parts[2].trim()
            };
        } else if (parts.length === 2) {
            return {
                url: parts[0].trim(),
                name: parts[1].trim(),
                description: ''
            };
        } else {
            // Legacy format - just URL
            return {
                url: parts[0].trim(),
                name: parts[0].trim(),
                description: ''
            };
        }
    });
}

// Convert basic markdown to HTML
function markdownToHtml(text) {
    if (!text) return '';
    
    let html = text;
    
    // Handle bold **text** FIRST (before splitting into paragraphs to avoid conflicts)
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Split by double newlines for paragraphs
    const blocks = html.split('\n\n');
    const processedBlocks = [];
    
    for (let block of blocks) {
        block = block.trim();
        if (!block) continue;
        
        // Split block into lines
        const lines = block.split('\n').map(l => l.trim()).filter(l => l);
        
        // Separate bold-only lines from list items
        const result = [];
        let currentList = [];
        let currentListType = null; // 'numbered', 'bullet', or null
        
        for (const line of lines) {
            // Check if line is a markdown header (####, #####, ######)
            const h6Match = line.match(/^######\s+(.+)$/);
            const h5Match = line.match(/^#####\s+(.+)$/);
            const h4Match = line.match(/^####\s+(.+)$/);
            
            // Check if line is bold-only (heading)
            const isBoldOnly = line.match(/^<strong>.+<\/strong>$/);
            
            // Check if line is a list item
            const isNumbered = line.match(/^\d+\.\s/);
            const isBullet = line.match(/^[-*]\s/);
            
            if (h6Match) {
                // Flush current list if any
                if (currentList.length > 0) {
                    if (currentListType === 'numbered') {
                        result.push(`<ol class="list-decimal list-inside my-4">${currentList.join('')}</ol>`);
                    } else if (currentListType === 'bullet') {
                        result.push(`<ul class="list-disc list-inside my-4">${currentList.join('')}</ul>`);
                    }
                    currentList = [];
                    currentListType = null;
                }
                result.push(`<h6 class="text-sm font-semibold mt-4 mb-2 text-gray-800 dark:text-gray-200">${h6Match[1]}</h6>`);
            } else if (h5Match) {
                // Flush current list if any
                if (currentList.length > 0) {
                    if (currentListType === 'numbered') {
                        result.push(`<ol class="list-decimal list-inside my-4">${currentList.join('')}</ol>`);
                    } else if (currentListType === 'bullet') {
                        result.push(`<ul class="list-disc list-inside my-4">${currentList.join('')}</ul>`);
                    }
                    currentList = [];
                    currentListType = null;
                }
                result.push(`<h5 class="text-base font-semibold mt-4 mb-2 text-gray-800 dark:text-gray-200">${h5Match[1]}</h5>`);
            } else if (h4Match) {
                // Flush current list if any
                if (currentList.length > 0) {
                    if (currentListType === 'numbered') {
                        result.push(`<ol class="list-decimal list-inside my-4">${currentList.join('')}</ol>`);
                    } else if (currentListType === 'bullet') {
                        result.push(`<ul class="list-disc list-inside my-4">${currentList.join('')}</ul>`);
                    }
                    currentList = [];
                    currentListType = null;
                }
                result.push(`<h4 class="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-white">${h4Match[1]}</h4>`);
            } else if (isBoldOnly) {
                // Flush current list if any
                if (currentList.length > 0) {
                    if (currentListType === 'numbered') {
                        result.push(`<ol class="list-decimal list-inside my-4">${currentList.join('')}</ol>`);
                    } else if (currentListType === 'bullet') {
                        result.push(`<ul class="list-disc list-inside my-4">${currentList.join('')}</ul>`);
                    }
                    currentList = [];
                    currentListType = null;
                }
                // Add bold text as paragraph
                result.push(`<p>${line}</p>`);
            } else if (isNumbered) {
                // Flush if switching list types
                if (currentListType === 'bullet' && currentList.length > 0) {
                    result.push(`<ul class="list-disc list-inside my-4">${currentList.join('')}</ul>`);
                    currentList = [];
                }
                currentListType = 'numbered';
                const text = line.replace(/^\d+\.\s/, '').trim();
                currentList.push(`<li>${text}</li>`);
            } else if (isBullet) {
                // Flush if switching list types
                if (currentListType === 'numbered' && currentList.length > 0) {
                    result.push(`<ol class="list-decimal list-inside my-4">${currentList.join('')}</ol>`);
                    currentList = [];
                }
                currentListType = 'bullet';
                const text = line.replace(/^[-*]\s/, '').trim();
                currentList.push(`<li>${text}</li>`);
            } else {
                // Flush current list if any
                if (currentList.length > 0) {
                    if (currentListType === 'numbered') {
                        result.push(`<ol class="list-decimal list-inside my-4">${currentList.join('')}</ol>`);
                    } else if (currentListType === 'bullet') {
                        result.push(`<ul class="list-disc list-inside my-4">${currentList.join('')}</ul>`);
                    }
                    currentList = [];
                    currentListType = null;
                }
                // Regular text
                result.push(`<p>${line}</p>`);
            }
        }
        
        // Flush any remaining list
        if (currentList.length > 0) {
            if (currentListType === 'numbered') {
                result.push(`<ol class="list-decimal list-inside my-4">${currentList.join('')}</ol>`);
            } else if (currentListType === 'bullet') {
                result.push(`<ul class="list-disc list-inside my-4">${currentList.join('')}</ul>`);
            }
        }
        
        processedBlocks.push(result.join('\n'));
    }
    
    html = processedBlocks.join('\n');
    
    // Handle italic *text* (AFTER bold and lists to avoid conflicts)
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    return html;
}

// Initialize content data
let contentData = [];
let mainTagDefinitions = {};
let typeDefinitions = {};
let tagDefinitions = {};

// Make globally accessible
window.contentData = contentData;
window.mainTagDefinitions = mainTagDefinitions;
window.typeDefinitions = typeDefinitions;
window.tagDefinitions = tagDefinitions;
window.markdownToHtml = markdownToHtml;

// Load on page load
(async function() {
    const data = await loadContentFromMarkdown();
    contentData = data.content;
    mainTagDefinitions = data.mainTagDefinitions;
    typeDefinitions = data.typeDefinitions;
    tagDefinitions = data.tagDefinitions;
    
    // Update global references
    window.contentData = contentData;
    window.mainTagDefinitions = mainTagDefinitions;
    window.typeDefinitions = typeDefinitions;
    window.tagDefinitions = tagDefinitions;
    
    // Dispatch event when content is loaded
    window.dispatchEvent(new CustomEvent('contentLoaded', { detail: data }));
})();
