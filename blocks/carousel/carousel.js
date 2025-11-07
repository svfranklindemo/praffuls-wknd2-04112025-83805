import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import createSlider from '../../scripts/slider.js';


function setCarouselItems(number) {
    document.querySelector('.carousel > ul')?.style.setProperty('--items-per-view', number);
}

export default function decorate(block) {
  let i = 0;
  setCarouselItems(2);
  const slider = document.createElement('ul');
  const leftContent = document.createElement('div');
  [...block.children].forEach((row) => {
    if (i > 3) {
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
      slider.append(li);
    } else {
      if (row.firstElementChild.firstElementChild) {
        leftContent.append(row.firstElementChild.firstElementChild);
      }
      if (row.firstElementChild) {
        leftContent.append(row.firstElementChild.firstElementChild || '');
      }
      leftContent.className = 'default-content-wrapper';
    }
    i += 1;
  });

  slider.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.parentNode.parentNode.prepend(leftContent);
  block.append(slider);
  createSlider(block);

  const blocks = document.querySelectorAll(`.carousel`);
  blocks.forEach((block, index) => {
    block.id = `carousel-${index}`;
    
    // Add indexed IDs to images within the block (simple format)
    const images = block.querySelectorAll('img');
    images.forEach((img, imgIndex) => {
      const imgId = `carousel_${index}_image_${imgIndex}`;
      img.id = imgId;
    });

    // Add indexed IDs to all card divs (both image and body) with container context
    const listItems = block.querySelectorAll('li');
    listItems.forEach((li, liIndex) => {
      // Add container index to all child divs in this card
      const cardDivs = li.querySelectorAll(':scope > div');
      cardDivs.forEach((div) => {
        div.setAttribute('data-container-index', liIndex);
      });
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
        
        el.id = `carousel_${index}_container_${containerIndex}_${tag}_${tagIndex}`;
        el.setAttribute(`data-text-content-id`, el.id);
      });
    });
  });
}
