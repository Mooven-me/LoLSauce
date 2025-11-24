<?php

namespace App\Service\enums; 

enum QuestionsTypes : string {
    case pixel_image = 'pixel_image';
    case skin_image = 'skin_image';
    case spell_image = 'spell_image';
    case passive_image = 'passive_image';
    case item_image = 'item_image';
    case lore = 'lore';
}