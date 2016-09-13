# select-cards.js

Turn your plain `<select>` elements in to Semantic UI's Cards component.

## Dependencies
- jQuery
- FontAwesome
- Semantic UI Card Css
- Semantic UI Button Css
- Semantic UI Label CSS

In case you don't want to load another files, then just copy their code.
Actually, there's a reason Semantic UI splitted their assets. You can find them on CDNs like cdnjs.com

## Options
###### See Semantic UI's documentation for available classes
=======

| Name | Type |	Default |	Description |
| ---- |:----:|:-------:|:----------- |
| addLabelColor | string | 'green' | Added label color |
| addLabelPosition | string | 'right' | Added label position |
| buttonColor | string | 'positive' | Add button color |
| addLabel | string | 'Add' | Add button label |
| removeLabel |string|'Remove'| Remove button label|
| cardPerSlide | int | 4 | Number of cards to show per page |
| slideBy | int | 1 | Number of cards to slide by after clicking next button |
| maxItems | int | 4 | Uses cardPerSlide value as default. This is useful if remote option is needed|
| remote | string | false | Url on where to fetch more options |
| nextButton | string| none | Specify a selector for next button |
| prevButton | string | none| Specify a selector for previous button|

## Callbacks
###### Available callbacks currently
=======
| Name | Description |	Parameter |
| ---- |:----:|:-------:|
| onInitialize| You can do stuffs here after the plugin has been initialize | none|
| onFetch | What to do with the response after fetching | API response |

```
// Example
selectCards({
    onFetch: function(){},
    onInitialize: function(){}
});
```

## Usage
=======

```
<div>
    <select id="example">
        <option value="1" data-img="/img/example.png">Exapmle Text</option>
    </select>
    <button type="button" id="prevbtn">Previous<button>
    <button type="button" id="nextbtn">Next<button>
</div>
    
var selectCards = $('#example').selectCards({
    nextButton:'#nextbtn',
    previousButton: '#prevbtn'
});

// Next Slide
$('#nextbtn').on('click', function(){
    selectCards.next();
});

// Previous Slide
$('#prevtbtn').on('click', function(){
    selectCards.previous();
});

// Responsive helper / Modal Usage just use refreshWidth().
// Example:

$modal.on('modal.show.event', function(){
    selectCards.refreshWidth();
});

$(window).on('resize', function(){
    refreshWidth();
});

// Reset. Remove all active.
// In case you need to reset the form, select values might be reset
// but the cards are not aware of this.

selectCards.reset();

// Manually Select A Value
selectCards.toggle(value)

```

<b>NOTE:</b>
If the toggled value is not yet on the list and `remote` option is enabled, it will be placed on the `pending` lists and once that item is fetched it will automatically be selected and will be removed from the pending list

<b>Important: </b> Items on pending list will not be added on the hidden `select` which means, if you submitted the form while that card/option is not yet fetched, that pending item will not be submitted. Will see if a fix is needed. Haven't found any reason yet.


## Remote
=======

If remote option is wanted, please specify a value for the `maxItems` as the maximum number of items that can be fetched from the API (example: max row count).

If you already have a working `search` API, the plugin is sending additional data named as `action` with a value of `next` and `last_id` with the value of the last data-value inserted in the DOM.

Normally you would do something like this in your API if you will use this:
```
if($request->action == 'next'){
    $foods = Food::where('id', '>', $request->last_id)->first();
}
```

## Changelog:

Version 2
- added `slideBy` option
- added `pending` list internally.
- added `toggle` method
