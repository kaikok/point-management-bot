# Evaluation of FSM libraries

To support conversation state management

|Feature \ Module|robot3|machina|XState|Weighting|
|-|-|-|-|-|
|Serialization / Deserialization|🔴No - DIY|🟢Yes|🟢Yes|3|
|Dynamic extension of state machine|🔴No|🟢Yes|🔴No|1|
|Callback on event/transition|🔴No - DIY|🟢Yes|🔴No - DIY|2|
|Callback on state change|🟢Yes - onChange|🔴No - DIY |🟢Yes - subscribe|1|
|Synchronous functions|🟢Yes - invoke promise|🔴No - DIY|🟢Yes - fromPromise actor|3
|Parallel States|🔴No - DIY|🟢Yes - subscribing events|🟢Yes - modeling|2
|Nested States|🟢Yes|🟢Yes|🟢Yes|3
|Extended state context|🟢Yes|🔴No - DIY|🟢Yes|2
|Transition guards|🟢Yes|🔴No - DIY|🟢Yes|2
|Runs on browser/nodejs|🟢Yes|🟢Yes|🟢Yes|1
|Integrates with frontend libraries|🟢Yes|🔴No|🟢Yes|1
|Bundle Size/Compressed|🟢25.6 kB / 5.36 KB|🟡 234 kB / 62.3 KB |🔴1.6 MB/323 kB|1
|USP: Visualizer |🟢Yes - 3rd party, DOM based|🔴No|🔴No - in favor of cloud editor|3
|USP: visual cloud editor |🔴No|🔴No|🟢Yes|3
|USP: single page explains most functionality|🔴No|🟢Yes|🔴No|1


|Feature \ Module|robot3|machina|XState|
|-|-|-|-|
|Serialization / Deserialization|0|3|3|
|Dynamic extension of state machine|0|1|0|
|Callback on event/transition|0|2|0|
|Callback on state change|1|0|1|
|Synchronous functions|3|0|3|
|Parallel States|0|2|2|
|Nested States|0|0|3|
|Extended state context|2|0|2|
|Transition guards|2|0|2|
|Runs on browser/nodejs|1|1|1|
|Integrates with frontend libraries|1|0|1|
|Bundle Size/Compressed|1|0|0|
|USP: Visualizer |3|0|0|
|USP: visual cloud editor |0|0|3|
|USP: single page explains most functionality|0|1|0|
|**TOTAL**|14|10|21|

