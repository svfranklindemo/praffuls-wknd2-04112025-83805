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
    
    // Add indexed IDs to card body divs (which contain text content from AEM nodes)
    const cardBodies = block.querySelectorAll('.cards-card-body');
    cardBodies.forEach((cardBody, bodyIndex) => {
      cardBody.id = `carousel_${index}_container_${bodyIndex}`;
      cardBody.setAttribute('data-container-index', bodyIndex);
    });

    // Add indexed IDs to images within the block with container context
    const images = block.querySelectorAll('img');
    images.forEach((img) => {
      const container = img.closest('[data-container-index]');
      const containerIndex = container ? container.getAttribute('data-container-index') : 'unknown';
      
      // Count images within its container
      const containerImages = container ? container.querySelectorAll('img') : [img];
      const imgIndex = Array.from(containerImages).indexOf(img);
      
      const imgId = `carousel_${index}_container_${containerIndex}_image_${imgIndex}`;
      img.id = imgId;
      
      // If image is inside a picture element, also add a data attribute to the picture
      const picture = img.closest('picture');
      if (picture) {
        picture.setAttribute('data-img-id', imgId);
      }
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
        
        heading.id = `carousel_${index}_container_${containerIndex}_${tag}_${tagIndex}`;
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
      
      p.id = `carousel_${index}_container_${containerIndex}_p_${pIndex}`;
    });
  });
}
