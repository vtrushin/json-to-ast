- [X] Remove `position.human`
- [X] `position.char` -> `position.offset`
- [X] `position` -> `loc`
- [X] Added `fileName` to `loc`
- [x] Set consistent structure. Change `properties` and `items` to `nodes`/`children`/`items`
- [x] String escaping  
*Roman Dvornov*  
вот "\\n" превращается в 'string with escaped \\\\n'  
нужпо видимо делать JSON.parse для нее  
кхм... в общем не понятно  
сейчас может и правильно, что делается так - чтобы обратно можно было собрать 1:1  
но вот чтобы получить нормальную строку, как возвращает JSON.parse, нужно сделать  
`JSON.parse('"' + property.key.value + '"')`  
не очень то прикольно :wink:
- [x] Add more tests from "test" branch
- [ ] Move astexplorer example to solid project
- [ ] Add coverage
