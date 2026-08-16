Family Box
===

This is just a minimal server I have developed for my local network to save the recipes 
written on increasingly decaying index cards, slips of paper, or even sections of cardboard 
accumulated over the years.
While the data remains private, I am making the code public.
It has also been extended to use React, with the main page serving as a hub for various 
services, one of which is the recipe server.

Motivation
---

While this started out as a simple file server, user demand forced me to develop this 
into a full-stack project.
Despite the name, I am not getting into any database management here.
This project relies on recipe data stored in a single JSON.
No encryption, no SQL shenanigans, just simple text file management.

Recipe data
---

This recipe endpoint relies on a JSON file with the format,

```json
{
    "recipes": [
        {
            "name": "STRING",
            "ingredients": ["[]STRING..."],
            "instructions": ["[]STRING..."],
            "cook time": "NUMBER"
        }
        ...
    ]
}
```

Development
---

Feel free to use the code as you wish, but this is really a personal project and you can probably come up with 
better implementations of it starting from scratch.

The state of this project at the moment is rather RESTful, since you are able to create, edit, and delete 
recipes from the frontend.
It is also dynamic due to the recent React refactor.

The media fileservers, for images and videos, is still in development.

