- [X] Remove `position.human`
- [X] `position[start/end].char` -> `position[start/end].offset`
- [X] `position` -> `loc`
- [X] Added `fileName`
- [ ] String escaping<sup>1</sup>
- [ ] Set consistent structure. Change `properties` and `items` to `nodes`/`children`/`items`

<sup>1</sup>
**Roman Dvornov**  
вот "\\n" превращается в 'string with escaped \\\\n'  
нужпо видимо делать JSON.parse для нее  
кхм... в общем не понятно  
сейчас может и правильно, что делается так - чтобы обратно можно было собрать 1:1  
но вот чтобы получить нормальную строку, как возвращает JSON.parse, нужно сделать  
`JSON.parse('"' + property.key.value + '"')`  
не очень то прикольно :wink:  
