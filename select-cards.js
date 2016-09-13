(function($){

    $.fn.selectCards = function(options){

        var defaults = {
            // Design / Classes
            addLabelColor: 'green',
            addLabelPosition: 'right',
            buttonColor: 'positive',
            addLabel: 'Add',
            removeLabel: 'Remove',

            // Plugin related
            cardPerSlide: 4,
            slideBy: 1,
            maxItems: 0,
            remote: false,
            onFetch: function(response){
                let $lastCard = $wrapper.find('.ui.card').last();

                $lastCard
                    .find('img')
                        .prop('src', response.photo)
                        .css('visibility', 'visible')
                        .end()
                    .find('.content')
                        .html('<strong>'+response.name+'</strong>')
                        .end()
                    .find('button.bottom.attached')
                        .data('value', response.id);

                // Check if this item is in pending
                let index = $.inArray(response.id.toString(), pending);

                if(index !== -1){
                    $lastCard
                        .find('button.bottom.attached')
                        .trigger('click');

                    // remove it from the pending list
                    pending.splice(index, 1);

                }

                if($wrapper.find('.ui.card').length !== maxItems){
                    $(settings.nextButton).removeProp('disabled');
                }
            },
            onInitialize: function(){},

            // Selector
            nextButton: '',
            previousButton: ''
        };

        var settings = $.extend({}, defaults, options);

        var
            $element = this,
            $options = this.find('option'),
            $wrapper = $('<div />')
                .addClass('select cards')
                .insertAfter(this);

        // Used by plugin
        var
            multiple = $element.prop('multiple'),
            parentWidth,
            itemWidth,
            itemMargin,
            totalItemWidth,
            totalItems = $options.length, // By default, it uses the number of options.
            maxItems   = settings.maxItems !== 0 ? settings.maxItems : totalItems, // By default, it uses totalItems. If remote add max items.
            currentX   = 0,
            pending    = [];

        this.initialize = function(){
            $element.css('display', 'none');
            console.log($wrapper)

            if($options.length > 0){
                $.each($options, function(){
                    let name  = $(this).html();
                    let value = $(this).val();
                    let image = $(this).data('img');

                    $element.addCard(name, image, value);
                });

                $element.refreshWidth();
            }

            settings.onInitialize();

            return this;
        }

        this.addCard = function(name, image, value){

            if($element.has(value.toString())) return false;

            $cardTemplate = $('<div />')
                .addClass('ui card')
                .appendTo($wrapper);

                $cardImageTemplate = $('<div />')
                    .addClass('ui image')
                    .appendTo($cardTemplate);

                    $cardSelectedLabel = $('<span />')
                        .addClass('ui '+
                            settings.addLabelColor+' '+
                            settings.addLabelPosition+
                            ' ribbon label')
                        .css('opacity', '0')
                        .text('Added')
                        .appendTo($cardImageTemplate);

                    $cardImage = $('<img />')
                        .prop('src', image)
                        .appendTo($cardImageTemplate);

                $cardContent = $('<div />')
                    .addClass('content')
                    .appendTo($cardTemplate);

                    $cardName = $('<strong />')
                        .html(name)
                        .appendTo($cardContent);

                $cardButton = $('<button />')
                    .data('value', value)
                    .prop('type', 'button')
                    .prop('tabindex', 0)
                    .addClass('ui bottom '+
                        settings.buttonColor+
                        ' attached button')
                    .appendTo($cardTemplate);

                    $cardButtonIcon = $('<i />')
                        .addClass('fa fa-fw fa-plus')
                        .appendTo($cardButton);

                    $cardButtonLabel = $('<span />')
                        .html(settings.addLabel)
                        .appendTo($cardButton);

            $element.refreshWidth();

            return this;
        }

        this.refreshWidth  = function(parentWidth){
            parentWidth    = parentWidth ? parentWidth : $element.parent().width();
            itemWidth      = parentWidth*( 100/settings.cardPerSlide*0.01 ); // Get percentage. 100/4 = 25%
            itemMargin     = parseFloat( $wrapper.find('.ui.card').first().css('margin-right') );
            totalItems     = $wrapper.find('.ui.card').length;
            totalItemWidth = itemWidth + itemMargin*2;

            $wrapper.find('.ui.card').css('width', itemWidth-itemMargin*2);
            $wrapper.css('width', totalItemWidth * totalItems);

            return this;
        }

        this.next = function(){            
            if( currentX == itemWidth * (maxItems-settings.cardPerSlide) ){
                return false;
            }

            if(totalItems !== maxItems && settings.remote !== false){
                let $lastCard = $wrapper.find('.ui.card').last();
                let lastID    = $lastCard.find('button.bottom.button').data('value');

                $element.addCard('', '', '');

                $btnFoodsNext.prop('disabled', true)
                
                $.ajax({
                    url: settings.remote,
                    data: { action: 'next', last_id: lastID },
                    success: function(response){
                        settings.onFetch(response);
                    }
                });

                // Make last card image invisible while fetching
                $lastCard
                    .next()
                        .css('width', itemWidth-itemMargin*2)
                        .find('img')
                            .css('visibility', 'hidden');

            }

            $element.trigger('next.card');

            currentX += itemWidth*settings.slideBy;

            /*
            *   In case slideBy surpasses the number of cards we have
            *   Remove the excess number to slide
            */

            let maxX = (totalItems-settings.cardPerSlide) * itemWidth;

            if (currentX > maxX){
                let excessX = currentX - maxX;
                currentX = currentX - excessX;
            }

            $wrapper.css('transform', 'translate3D(-'+currentX+'px,0,0)');

            if(currentX == itemWidth * (maxItems-settings.cardPerSlide)){
                $(settings.nextButton).prop('disabled', true)
            }

            $(settings.previousButton).removeProp('disabled');

            $element.trigger('changed.card');

            return this;
        }

        this.previous = function(){
            if( currentX == 0 ){
                return false;
            }

            $element.trigger('previous.card');

            currentX -= itemWidth*settings.slideBy;

            /*
            *   If going back more than the first slide
            *   Remove the excess.
            */

            if (currentX < 0){
                let excessX = currentX*(-1);
                currentX = currentX + excessX;
            }

            $wrapper.css('transform', 'translate3D(-'+currentX+'px,0,0)');

            if(currentX == 0) $(settings.previousButton).prop('disabled', true);

            $(settings.nextButton).removeProp('disabled');

            $element.trigger('changed.card');

            return this;
        }

        this.has = function(value){
            value = value.toString();

            let options = $wrapper
            .find('button.bottom.attached')
            .filter(function(){
                return $(this).data('value').toString() == value
            });

            return options.length > 0;
        }

        this.toggle = function(value){

            array = Array.isArray(value) ? value : value.toString().split();
            let buttons = $wrapper.find('button.bottom.attached');

            $.each(array, function(index, val){

                // Value not in current lists.
                // When it is fetched, activate it
                if(!$element.has(val)){
                    pending.push(val)
                }

                buttons.filter(function(){
                    return $(this).data('value').toString() == val
                }).trigger('click')
            });
        }

        this.reset = function(){
            $wrapper
                .find('button.bottom.attached')
                .filter(function(index, element){
                    return !$(this).hasClass('positive')
                })
                .trigger('click');

            $element.trigger('reset');
            pending = [];

            return this;
        }

        $wrapper.on('click', 'button.bottom.attached', function(event){
            if($(this).hasClass('positive')){
                // Append data to select as <option>
                $element.append('<option selected value="'+$(this).data('value')+'" />');

                if(!multiple){
                    $wrapper.find('button.bottom.attached').filter(function(){
                        // Deactivate selected button.
                        return !$(this).hasClass('positive');
                    }).trigger('click');
                }

                $(this)
                    .removeClass('positive')
                    .data('selected', true)
                    .html(
                        '<i class="fa fa-fw fa-minus" /> '+settings.removeLabel
                    );

                $(this).closest('.card').find('.ribbon.label').css('opacity', '1');
            }else{
                // Remove <option> from select that matches the value
                $element.find('option').filter('[value="'+$(this).data('food-id')+'"]').remove();

                $(this)
                    .addClass('positive')
                    .data('selected', false)
                    .html(
                        '<i class="fa fa-fw fa-plus"></i> '+settings.addLabel
                    );

                $(this).closest('.card').find('.ribbon.label').css('opacity', '0');
            }
        });

        return this.initialize();
    };

}($));