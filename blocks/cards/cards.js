/*
import { patternDecorate } from '../../scripts/blockTemplate.js';

export default async function decorate(block) {
  patternDecorate(block);
}
*/

import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    const style = row.lastElementChild?.querySelector('p')?.textContent;
    //const style = row.querySelector('p[data-aue-label="Style"]')?.textContent;
    if(style){
      li.className = style;
      row.lastElementChild?.remove();
    }
    
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
 
  block.textContent = '';
  block.append(ul);

  const blocks = document.querySelectorAll(`.cards`);
  blocks.forEach((block, index) => {
    block.id = `cards-${index}`;
    
    // Add indexed IDs to images within the block
    const images = block.querySelectorAll('img');
    images.forEach((img, imgIndex) => {
      const imgId = `cards_${index}_image_${imgIndex}`;
      img.id = imgId;
      
      // If image is inside a picture element, also add a data attribute to the picture
      const picture = img.closest('picture');
      if (picture) {
        picture.setAttribute('data-img-id', imgId);
      }
    });

    // Add indexed IDs to card body divs (which contain text content from AEM nodes)
    const cardBodies = block.querySelectorAll('.cards-card-body');
    cardBodies.forEach((cardBody, bodyIndex) => {
      cardBody.id = `cards_${index}_container_${bodyIndex}`;
      cardBody.setAttribute('data-container-index', bodyIndex);
    });

    // Add indexed IDs to heading elements with container context
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach((tag) => {
      const headings = block.querySelectorAll(tag);
      headings.forEach((heading) => {
        const container = heading.closest('[data-container-index]');
        const containerIndex = container ? container.getAttribute('data-container-index') : 'unknown';
        
        // Count this tag within its container
        const containerHeadings = container ? container.querySelectorAll(tag) : [heading];
        const tagIndex = Array.from(containerHeadings).indexOf(heading);
        
        heading.id = `cards_${index}_container_${containerIndex}_${tag}_${tagIndex}`;
      });
    });

    // Add indexed IDs to paragraph elements with container context
    const paragraphs = block.querySelectorAll('p');
    paragraphs.forEach((p) => {
      const container = p.closest('[data-container-index]');
      const containerIndex = container ? container.getAttribute('data-container-index') : 'unknown';
      
      // Count paragraphs within its container
      const containerParagraphs = container ? container.querySelectorAll('p') : [p];
      const pIndex = Array.from(containerParagraphs).indexOf(p);
      
      p.id = `cards_${index}_container_${containerIndex}_p_${pIndex}`;
    });
  });
}
