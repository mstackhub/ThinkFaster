/**
 * ThinkFaster Utility Helper Functions
 */

/**
 * Format number to Thai Currency (e.g. ฿1,990)
 */
export function formatCurrency(amount, currency = 'THB') {
  if (amount === null || amount === undefined || isNaN(amount)) return '';
  const num = Number(amount);
  return '฿' + new Intl.NumberFormat('th-TH').format(num);
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Format ISO date string into readable Thai date
 */
export function formatDate(isoString) {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return isoString;
  }
}

/**
 * Validate external or internal URL
 */
export function isValidUrl(string) {
  if (!string) return false;
  // Block dangerous schemes
  const lower = string.trim().toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
    return false;
  }
  try {
    const url = new URL(string, window.location.origin);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

/**
 * Generate URL-friendly slug
 */
export function generateSlug(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0E00-\u0E7F-]+/g, '') // Allow alphanumeric & Thai characters
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Auto-generate next project code like "001", "002"
 */
export function generateNextCode(projects = []) {
  if (!projects || projects.length === 0) return '001';
  let maxNum = 0;
  for (const p of projects) {
    if (p.code) {
      const parsed = parseInt(p.code.replace(/\D/g, ''), 10);
      if (!isNaN(parsed) && parsed > maxNum) {
        maxNum = parsed;
      }
    }
  }
  const nextNum = maxNum + 1;
  return String(nextNum).padStart(3, '0');
}

/**
 * Browser-side Image Compression (Canvas)
 * Resizes large images to max width 1920px and compresses to WebP/JPEG
 */
export function compressImage(file, maxWidth = 1920, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file.type.match(/image.*/)) {
      return reject(new Error('File is not an image'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = (readerEvent) => {
      const image = new Image();
      image.onerror = () => reject(new Error('Failed to load image'));
      image.onload = () => {
        let width = image.width;
        let height = image.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);

        const mimeType = 'image/webp';
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                type: mimeType,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              // Fallback to original if conversion fails
              resolve(file);
            }
          },
          mimeType,
          quality
        );
      };
      image.src = readerEvent.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Clipboard API failed, trying fallback', err);
    }
  }

  // Fallback for older browsers
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.top = '-9999px';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  let successful = false;
  try {
    successful = document.execCommand('copy');
  } catch (err) {
    console.error('Fallback copy failed', err);
  }
  document.body.removeChild(textArea);
  return successful;
}

/**
 * Global Toast System
 */
export function showToast(message, type = 'success', duration = 3000) {
  let toastContainer = document.getElementById('global-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'global-toast-container';
    toastContainer.className = 'fixed top-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm pointer-events-none';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-slide-down transition-all duration-300';

  let iconSvg = '';
  if (type === 'success') {
    toast.classList.add('bg-white', 'text-slate-800', 'border-emerald-200');
    iconSvg = `<svg class="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`;
  } else if (type === 'error') {
    toast.classList.add('bg-white', 'text-slate-800', 'border-rose-200');
    iconSvg = `<svg class="w-5 h-5 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>`;
  } else if (type === 'warning') {
    toast.classList.add('bg-white', 'text-slate-800', 'border-amber-200');
    iconSvg = `<svg class="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`;
  } else {
    toast.classList.add('bg-white', 'text-slate-800', 'border-blue-200');
    iconSvg = `<svg class="w-5 h-5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
  }

  toast.innerHTML = `
    ${iconSvg}
    <div class="flex-1">${escapeHTML(message)}</div>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-x-full');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);
}

/**
 * Format inline Markdown syntax (**bold**, *italic*, `code`)
 */
export function formatInlineMarkdown(text) {
  if (!text) return '';
  let res = escapeHTML(text);

  // Bold: **text** or __text__
  res = res.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
  res = res.replace(/__(.+?)__/g, '<strong class="font-bold text-slate-900">$1</strong>');

  // Italic: *text* or _text_
  res = res.replace(/\*([^\*]+?)\*/g, '<em class="italic text-slate-800">$1</em>');
  res = res.replace(/_([^_]+?)_/g, '<em class="italic text-slate-800">$1</em>');

  // Inline code: `code`
  res = res.replace(/`([^`]+?)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-xs text-blue-700 font-semibold">$1</code>');

  return res;
}

/**
 * Convert multiline plain text / Markdown overview into structured styled HTML
 * Handles: **bold**, bullet items (•, -, *), numbered steps (1., 2.), headings (#, ##), and demo accounts
 */
export function formatOverviewHTML(rawText) {
  if (!rawText || !rawText.trim()) {
    return '<p class="text-slate-400 text-sm">ไม่มีรายละเอียดเพิ่มเติม</p>';
  }

  const blocks = rawText.split(/\r?\n\r?\n/);
  const renderedBlocks = [];

  for (const block of blocks) {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) continue;

    const lines = trimmedBlock.split(/\r?\n/);

    // Check for Demo Account Box
    const isDemoBlock = lines[0].toLowerCase().startsWith('demo') ||
      (lines.some(l => /^user\s*:/i.test(l.trim())) && lines.some(l => /^pass/i.test(l.trim())));

    if (isDemoBlock) {
      let title = 'ข้อมูลสำหรับทดลองใช้งาน Demo';
      const credLines = [];

      for (const line of lines) {
        const l = line.trim();
        if (/^demo/i.test(l)) {
          title = formatInlineMarkdown(l);
        } else if (l) {
          credLines.push(formatInlineMarkdown(l));
        }
      }

      renderedBlocks.push(`
        <div class="my-5 p-4 sm:p-5 rounded-2xl bg-slate-900 text-white shadow-md border border-slate-800">
          <div class="font-bold text-sm sm:text-base text-blue-400 flex items-center gap-2 mb-2.5">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
            </svg>
            <span>${title}</span>
          </div>
          <div class="space-y-1.5 font-mono text-xs sm:text-sm text-slate-200 bg-slate-800/90 p-3 rounded-xl border border-slate-700/70 select-all leading-relaxed">
            ${credLines.join('<br>')}
          </div>
        </div>
      `);
      continue;
    }

    // Process mixed lines
    let inList = false;
    let listItemsHTML = '';
    let blockHTML = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const bulletMatch = line.match(/^([•\-\*\+\—])\s*(.*)$/);
      const numberMatch = line.match(/^(\d+[\.\)])\s*(.*)$/);
      const headingMatch = line.match(/^(#{1,4})\s*(.*)$/);

      if (bulletMatch) {
        if (!inList) {
          inList = true;
          listItemsHTML = '';
        }
        const content = formatInlineMarkdown(bulletMatch[2]);
        listItemsHTML += `
          <li class="flex items-start gap-2.5 my-2 text-slate-700 text-sm sm:text-base leading-relaxed">
            <span class="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2"></span>
            <span class="flex-1">${content}</span>
          </li>
        `;
      } else {
        if (inList) {
          blockHTML += `<ul class="my-2 space-y-1 pl-1">${listItemsHTML}</ul>`;
          inList = false;
          listItemsHTML = '';
        }

        if (numberMatch) {
          const num = numberMatch[1];
          const content = formatInlineMarkdown(numberMatch[2]);
          blockHTML += `
            <div class="font-bold text-slate-900 text-sm sm:text-base mt-4 mb-1.5 flex items-start gap-2.5">
              <span class="inline-flex items-center justify-center min-w-[24px] h-[24px] px-1 rounded-md bg-blue-100 text-blue-700 text-xs font-bold shrink-0 mt-0.5">${num}</span>
              <span class="flex-1 leading-snug">${content}</span>
            </div>
          `;
        } else if (headingMatch) {
          const level = headingMatch[1].length;
          const content = formatInlineMarkdown(headingMatch[2]);
          const cls = level === 1 ? 'text-lg sm:text-xl font-extrabold text-slate-900 mt-6 mb-3' :
                      level === 2 ? 'text-base sm:text-lg font-bold text-slate-900 mt-5 mb-2' :
                      'text-sm sm:text-base font-bold text-slate-900 mt-4 mb-1.5';
          blockHTML += `<h${level + 1} class="${cls}">${content}</h${level + 1}>`;
        } else {
          // Check if line looks like a bold header (e.g. "6 จุดเด่นสำคัญ..." or wrapped in **)
          const isLeadHeader = /^\d+\s*จุดเด่น/i.test(line) || /^จุดเด่น/i.test(line) || /^ฟีเจอร์/i.test(line);
          const content = formatInlineMarkdown(line);
          if (isLeadHeader) {
            blockHTML += `<div class="font-bold text-slate-900 text-sm sm:text-base mt-4 mb-2">${content}</div>`;
          } else {
            blockHTML += `<p class="mb-3 leading-relaxed text-slate-700 text-sm sm:text-base">${content}</p>`;
          }
        }
      }
    }

    if (inList) {
      blockHTML += `<ul class="my-2 space-y-1 pl-1">${listItemsHTML}</ul>`;
    }

    renderedBlocks.push(blockHTML);
  }

  return renderedBlocks.join('');
}
