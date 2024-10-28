---
title: "Concept"
layout: page
order: 1
image: "/assets/img/ultiblocks-banner.webp"
---

# Welcome to the Concept Page

Here you can find various sections and information related to the **Ultiblocks** modular ecosystem. This includes guides, tutorials, and more to get you started.

<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
    {% for subpage in collections.pages %}
        {% if subpage.data.parent == "Concept" %}
            <div class="rounded shadow-md h-full p-2 mb-2">
                <a href="{{ subpage.url | url }}">
                    <img class="w-full m-0 rounded-t" src="{{ subpage.data.image | url }}" loading="lazy" width="960" height="500" alt="{{ subpage.data.title }}">
                </a>
                <div class="px-6 py-5">
                    <div class="font-semibold text-lg mb-2">
                        <a class="text-slate-900 hover:text-slate-700" href="{{ subpage.url | url }}">{{ subpage.data.title }}</a>
                    </div>
                    {% if subpage.data.description %}
                        <p class="text-slate-800">{{ subpage.data.description }}</p>
                    {% else %}
                        <p class="text-slate-800">{{ subpage.templateContent | striptags | truncate(90, true) }}</p>
                    {% endif %}
                </div>
            </div>
        {% endif %}
    {% endfor %}
</div>
