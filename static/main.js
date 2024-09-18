$(document).ready(function(){
    $('#popup').show();

    // Adicionando evento de teclado ao campo de entrada de mensagem
    $('#message').keypress(function(event) {
        if (event.which === 13) { // Verifica se a tecla pressionada é Enter (código 13)
            sendMessage();
        }
    });

    // Adicionando evento de teclado ao campo de pesquisa de cartas
    $('#card-search').keypress(function(event) {
        if (event.which === 13) { // Verifica se a tecla pressionada é Enter (código 13)
            searchCard();
        }
    });
});

const socket = io();
let username = '';
const colors = ['#ff5733', '#33ff57', '#3357ff', '#f3ff33', '#ff33a6', '#a633ff', '#33fff5'];
let userColor = '';
let cardImage = '';
let selectedCardId = '';

function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

function enterChat() {
    username = $('#username').val();
    if (username) {
        userColor = getRandomColor();
        $('#popup').hide();
        $('#chat').removeClass('display_none').addClass('display_flex'); // Troca a classe para exibir o chat

        socket.emit('join', { username: username, color: userColor });
    }
}

socket.on('notification', function(msg){
    showNotification(msg);
    $('#messages').append($('<div>').text(msg));
});

// Chame essa função toda vez que uma nova mensagem for adicionada
socket.on('message', function(data) {
    const { user, message, color } = data;
    $('#messages').append($('<div>').html(`
        <span class="username" style="color:${color};">${user}:</span> 
        <span class="text-message">${message}</span>
    `));
    
    // Desce automaticamente ao receber uma nova mensagem
    scrollToBottom();


    // Adiciona um evento de clique às imagens das cartas para abrir no modal
    $('#messages img').off('click').on('click', function() {
        openCardModal($(this).attr('src'));
    });
});

function sendMessage() {
    const message = $('#message').val();
    if (message) {
        socket.emit('message', { user: username, message: message, color: userColor });
        $('#message').val('');
        
        // Desce automaticamente ao enviar uma nova mensagem
        scrollToBottom();
    }
}       

function openCardSearch() {
    $('#card-search-popup').show();
}

function searchCard() {
    const query = $('#card-search').val();
    if (query) {
        $.ajax({
            url: `https://api.scryfall.com/cards/search?q=${query}`,
            method: 'GET',
            success: function(data) {
                $('#card-search-results').empty();
                data.data.forEach(card => {
                    const cardDiv = $('<div>');
                    const cardImg = $('<img>').attr('src', card.image_uris ? card.image_uris.small : '').css('max-width', '100px');
                    const cardName = $('<span>').text(card.name);
                    const selectButton = $('<button>').text('Select').click(() => {
                        selectCard(card);
                    });
                    cardDiv.append(cardImg).append(cardName).append(selectButton);
                    $('#card-search-results').append(cardDiv);
                });
            },
            error: function() {
                alert('Card not found.');
            }
        });
    }
}

function selectCard(card) {
    selectedCardId = card.id;
    cardImage = card.image_uris ? card.image_uris.normal : '';
    $('#card-search-popup').hide();
    sendCard();
}

function sendCard() {
    if (cardImage) {
        socket.emit('message', { 
            user: username, 
            message: `<img src="${cardImage}" alt="Card image" class="card-image">`, 
            color: userColor 
        });
    }
}

function viewLargeCard() {
    $('#large-card-image').attr('src', cardImage);
    $('#large-card').show();
}

function closeLargeCard() {
    $('#large-card').hide();
}

function showNotification(message) {
    $('#notification').text(message).show();
    setTimeout(function() {
        $('#notification').hide();
    }, 2000);
}

// Funções para abrir e fechar o modal da imagem
function openCardModal(src) {
    $('#card-modal-image').attr('src', src);
    $('#card-modal').addClass('display_flex_on');
}

function closeCardModal() {
    $('#card-modal').hide();
    $('#card-modal').removeClass('display_flex_off');
}
function closeCardSearch() {
    $('#card-search-popup').hide();
}

// Função para descer automaticamente a tela de mensagens
function scrollToBottom() {
    const messages = document.getElementById('messages');
    messages.scrollTop = messages.scrollHeight; // Define a rolagem para o fim do conteúdo
}