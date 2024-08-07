// -- GLOBAL --
const MAX_CHARS = 150;
const BASE_API_URL = 'https://bytegrad.com/course-assets/js/1/api'

const textareaEl = document.querySelector('.form__textarea');
const counterEl = document.querySelector('.counter');
const formEl = document.querySelector('.form');
const feedbackEl = document.querySelector('.feedbacks');
const submitBtnEl = document.querySelector('.submit-btn');
const spinnerEl = document.querySelector('.spinner');
const listEl = document.querySelector('.feedback');
const hashtagListEl = document.querySelector('.hashtags');

const renderFeedbackItem = feedbackItem => {
    const feedbackItemHTLM = `
    <li class="feedback">
        <button class="upvote">
            <i class="fa-solid fa-caret-up upvote__icon"></i>
            <span class="upvote__count">${feedbackItem.upvoteCount}</span>
        </button>
        <section class="feedback__badge">
            <p class="feedback__letter">${feedbackItem.badgeLetter}</p>
        </section>
        <div class="feedback__content">
            <p class="feedback__company">${feedbackItem.company}</p>
            <p class="feedback__text">${feedbackItem.text}</p>
        </div>
        <p class="feedback__date">${feedbackItem.daysAgo === 0 ? 'NEW' : `${feedbackItem.daysAgo}d`}</p>
    </li>
    `

    // insert new feedback item
    feedbackEl.insertAdjacentHTML('beforeend', feedbackItemHTLM);
};

// -- COUNTER COMPONENT --
(() => {
    const counter = () => {
        const numOfCharacters = textareaEl.value.length;
        counterEl.textContent = MAX_CHARS - numOfCharacters;
    };
    
    textareaEl.addEventListener('input', counter);
})();

// FORM COMPONENT --
(() => {
    const showVisualIndicator = textCheck => {
        const className = textCheck === 'valid' ? 'form--valid' : 'form--invalid';
        formEl.classList.add(className);
        setTimeout(() => {
            formEl.classList.remove(className)
        }, 2000);
    }
    
    const submitHandler = () => {
        // get text from textarea
        const text = textareaEl.value;
      
        // check for # and if text is long enough
        if (text.includes('#') && text.length > 4) {
            showVisualIndicator('valid');
        } else {
            showVisualIndicator('invalid');
    
            // focus textarea
            textareaEl.focus();
    
            // if invalid do not continue
            return;
        }
    
        // card info from text
        const company = text.split(' ').find(word => word.includes('#')).substring(1);
        const badgeLetter = company.substring(0, 1).toUpperCase();
        const upvoteCount = 0;
        const daysAgo = 0;
    
        // render feedback item in list
        const feedbackItem = {
            upvoteCount: upvoteCount,
            company: company,
            badgeLetter: badgeLetter,
            daysAgo: daysAgo,
            text: text
        };
    
        renderFeedbackItem(feedbackItem);
    
        // send feedback item to server
        fetch('https://bytegrad.com/course-assets/js/1/api/feedbacks', {
            method: 'POST',
            body: JSON.stringify(feedbackItem),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(res => {
            if (!res.ok) {
                console.log('Something went wrong');
                return;
            }
            
            console.log('Successfully submitted');
        }).catch(error => console.log(error));
    
    
        // clear textarea
        textareaEl.value = '';
    
        // blur submit button
        submitBtnEl.blur();
    
        // reset counter
        counterEl.textContent = MAX_CHARS;
    };
    
    formEl.addEventListener('submit', submitHandler);
})();


// -- FEEDBACK lIST COMPONENT -- 
(() => {
    const clickHandler = e => {
        // get clicked HTML-element
        const clickedEl = e.target;
    
        
        // determine if user intended to upvote or expand
        const upvoteIntention = clickedEl.className.includes('upvote');
    
        if (upvoteIntention) {
            // get closest upvote button
            const upvoteBtnEl = clickedEl.closest('.upvote')
    
            // get currently displayed upvote count as a number / put a "+" in front of selector
            const upvoteCountEL = upvoteBtnEl.querySelector('.upvote__count');
            let upvoteCount = +upvoteCountEL.textContent;
    
            // set upvote count incremented by 1
            upvoteCountEL.textContent = ++upvoteCount;
    
            // disable upvote btn (prevent double clicks)
            upvoteBtnEl.disabled = true;
        } else {
            clickedEl.closest('.feedback').classList.toggle('feedback--expand');
        }
    
    };
    
    feedbackEl.addEventListener('click', clickHandler);
    
    
    // render feedback items 
    fetch('https://bytegrad.com/course-assets/js/1/api/feedbacks')
        .then(res => {
            return res.json();
        })
        .then(data => {
            // remove spinner
            spinnerEl.remove();
    
            // iterate over each elememnt in feedbacks array and render it in
            data.feedbacks.forEach(feedbackItem => renderFeedbackItem(feedbackItem));
        })
        .catch(error => {
            feedbackEl.textContent = ` Failed to fetch feedback items. Error message: ${error}`
        });
})();

// -- HASHTAG LIST COMPONET --
(() => {
    const clickHandler2 = (e) => {
        // get clicked target
        const clickedEl = e.target;
        const hashtagBtnEl = clickedEl.closest('.hashtag');
        const hashtagBtnText = hashtagBtnEl.textContent;
    
        // stop function if click happened in list but outside buttons
        if (clickedEl.className === 'hashtags') return;
    
        // extract company name
        const companyNameFromHashtag = hashtagBtnText.substring(1).toLowerCase().trim();
    
        // iterate over each feedback item in the list
        feedbackEl.childNodes.forEach(childNode => {
            // stop this iteration if it is a text node 
            if (childNode.nodeType === 3) return;
    
            // extract comapny name
            const companyNameFromFeedbackItem = childNode.querySelector('.feedback__company').textContent.toLowerCase().trim();
    
            // remove feedback item from list if company names are not equal
            if (companyNameFromHashtag !== companyNameFromFeedbackItem) {
                childNode.remove();
            }
        });
    };

    hashtagListEl.addEventListener('click', clickHandler2);
})();
