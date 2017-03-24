var view = p(
  'div', 
  {id: 'header'}, 
  [
      p(
        'div', 
        {textContent: 'Привіт, TernopilJS!'}
      ),
      p(
        'div', 
        {textContent: ' Базовий приклад SPA без використання сторонніх бібліотек.'}
      ),
      p(
        'a', 
        {
          href: '#', 
          textContent: 'Перейти на привітання', 
          onclick(evt) {evt.preventDefault(); router.navigate('/hello')}
        }
      ),
      p(
        'a', 
        {
          href: '#', 
          textContent: 'Перейти назад', 
          onclick(evt) {evt.preventDefault(); router.navigateBack()}
        }
      )
  ]
);

function p(name, attributes = null, children = null) {
  var elem = document.createElement(name);//Create element
  
  if (attributes) {//Sets attributes for this element
    for (var keys in attributes) {
      elem[keys] = attributes[keys];
    }
  }

  if (children) {//Add elements to this element
    children.forEach((item) => {
      elem.appendChild(item);
    });
    
  }

  return elem;
};

document.getElementById('albums').appendChild(view);