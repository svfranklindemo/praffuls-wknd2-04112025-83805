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
    
    // Add indexed IDs to all card divs (both image and body) with container context
    const listItems = block.querySelectorAll('li');
    listItems.forEach((li, liIndex) => {
      // Add container index to all child divs in this card
      const cardDivs = li.querySelectorAll(':scope > div');
      cardDivs.forEach((div) => {
        div.setAttribute('data-container-index', liIndex);
        if (div.classList.contains('cards-card-body')) {
          div.id = `cards_${index}_container_${liIndex}`;
        }
      });
    });

    // Add indexed IDs to images within the block with container context
    const images = block.querySelectorAll('img');
    images.forEach((img) => {
      const container = img.closest('[data-container-index]');
      const containerIndex = container ? container.getAttribute('data-container-index') : 'unknown';
      
      // Count images within its container
      const containerImages = container ? container.querySelectorAll('img') : [img];
      const imgIndex = Array.from(containerImages).indexOf(img);
      
      const imgId = `cards_${index}_container_${containerIndex}_image_${imgIndex}`;
      img.id = imgId;
      img.setAttribute('data-img-id', imgId);
    });

    // Add indexed IDs to heading elements with container context
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6','p'].forEach((tag) => {
      const elements = block.querySelectorAll(tag);
      elements.forEach((el) => {
        const container = el.closest('[data-container-index]');
        const containerIndex = container ? container.getAttribute('data-container-index') : 'unknown';
        
        // Count this tag within its container
        const containerElements = container ? container.querySelectorAll(tag) : [el];
        const tagIndex = Array.from(containerElements).indexOf(el);
        
        el.id = `cards_${index}_container_${containerIndex}_${tag}_${tagIndex}`;
        el.setAttribute(`data-text-content-id`, el.id);
      });
    });
  });
}
