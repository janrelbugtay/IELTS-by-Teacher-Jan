const fs = require('fs');
const path = require('path');

// 1. Write the HTML file
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CD-IELTS Listening Interface - Full Test</title>
    <script src="https://cdn.tailwindcss.com"></script>
    
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Arial:wght@400;700&display=swap');
        
        body { 
            font-family: Arial, Helvetica, sans-serif; 
            background-color: #e1e5eb;
        }

        .top-bar {
            background: linear-gradient(to bottom, #4a4a4a, #1a1a1a);
        }
        
        .ielts-input {
            width: 120px;
            height: 24px;
            border: 1px solid #7a7a7a;
            text-align: center;
            font-size: 14px;
            outline: none;
            transition: all 0.2s;
            border-radius: 2px;
            padding-bottom: 1px;
            margin: 0 4px;
        }

        .ielts-input-short {
            width: 40px;
            text-transform: uppercase;
        }

        .ielts-input:focus {
            border-color: #6eb0de;
            box-shadow: 0 0 3px #6eb0de;
        }

        .ielts-input::placeholder {
            color: #333;
            font-weight: bold;
            font-size: 13px;
        }

        .ielts-input.filled, .ielts-input.active-state {
            background-color: #e5f0fb;
            border-color: #6eb0de;
            color: #0b70b9;
            font-weight: bold;
        }

        .mcq-label {
            display: flex;
            align-items: flex-start;
            margin-bottom: 10px;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
        }
        
        .mcq-label:hover {
            background-color: #f3f4f6;
        }

        .mcq-radio, .mcq-checkbox {
            margin-top: 4px;
            margin-right: 12px;
            cursor: pointer;
            width: 16px;
            height: 16px;
            flex-shrink: 0;
        }

        .nav-btn {
            width: 22px;
            height: 22px;
            background-color: #222;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: bold;
            border-radius: 2px;
            cursor: pointer;
            border: 1px solid #000;
            transition: all 0.1s;
            position: relative;
        }

        .nav-btn:hover {
            background-color: #444;
        }

        .nav-btn.active {
            background-color: #7ab3e3;
            border-radius: 50%;
            color: white;
            width: 26px;
            height: 26px;
            margin: -2px 0;
            border: none;
            box-shadow: inset 0 0 4px rgba(0,0,0,0.2);
        }

        .nav-btn.answered::after {
            content: '';
            position: absolute;
            bottom: 2px;
            left: 50%;
            transform: translateX(-50%);
            width: 10px;
            height: 2px;
            background-color: #fff;
            border-radius: 1px;
        }

        ::-webkit-scrollbar { width: 12px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; border-left: 1px solid #ccc; }
        ::-webkit-scrollbar-thumb { background: #d1d1d1; border: 1px solid #bbb; }
        ::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }

        .part-section { display: none; }
        .part-section.active { display: block; }
        
        .content-box {
            border: 1px solid #333;
            padding: 24px;
            background-color: #fff;
            margin-bottom: 24px;
        }
    </style>
</head>
<body class="h-screen flex flex-col overflow-hidden text-[#333]">

    <div id="intro-screen" class="fixed inset-0 bg-[#e1e5eb] z-50 flex flex-col items-center justify-center">
        <div class="bg-white p-10 rounded shadow-lg w-[450px] border border-gray-300">
            <h1 class="text-2xl font-bold mb-2 text-center text-black">IELTS Listening Test</h1>
            <p class="text-sm text-gray-600 text-center mb-8">Please enter your details to begin the test.</p>
            
            <div class="mb-6">
                <label class="block text-sm font-bold mb-2 text-gray-800">Full Name</label>
                <input type="text" id="candidate-name-input" class="w-full border border-gray-400 p-2.5 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="e.g. John Doe" onkeydown="if(event.key === 'Enter') startTest()">
                <p id="name-error" class="text-red-500 text-xs font-bold mt-2 hidden">Please enter your full name.</p>
            </div>
            
            <button onclick="startTest()" class="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition shadow-sm text-lg">Start Test</button>
        </div>
    </div>

    <div class="top-bar text-white flex justify-between items-center px-4 py-1.5 text-sm shadow-md z-20 shrink-0">
        <div class="text-xs text-gray-300 font-bold tracking-wide">CANDIDATE NAME - <span id="display-candidate-name"></span></div>
        
        <div class="flex items-center gap-2 font-bold text-base tracking-wide absolute left-1/2 transform -translate-x-1/2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
            </svg>
            <span id="timer-display">40:00</span>
        </div>

        <div class="flex items-center gap-2">
            <button class="bg-gradient-to-b from-gray-100 to-gray-300 text-black px-3 py-0.5 rounded text-xs border border-gray-400 shadow-sm hover:from-white hover:to-gray-200">Settings</button>
            <button class="bg-gradient-to-b from-gray-100 to-gray-300 text-black px-3 py-0.5 rounded text-xs border border-gray-400 shadow-sm hover:from-white hover:to-gray-200">Help <span class="text-blue-700 font-bold ml-0.5">?</span></button>
            <button class="bg-gradient-to-b from-gray-100 to-gray-300 text-black px-3 py-0.5 rounded text-xs border border-gray-400 shadow-sm hover:from-white hover:to-gray-200">Hide</button>
            
            <div class="flex items-center ml-2">
                <button id="play-pause-btn" onclick="toggleAudio()" class="bg-blue-600 text-white px-3 py-0.5 rounded text-xs font-bold shadow-sm hover:bg-blue-700 flex items-center gap-1 transition-colors">
                    <svg id="play-icon" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                    </svg>
                    <svg id="pause-icon" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 hidden" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    <span id="play-text">Play</span>
                </button>
                <span id="audio-error" class="text-red-400 text-[10px] font-bold ml-2 hidden">Error loading audio</span>
            </div>

            <div class="flex items-center gap-2 ml-2 bg-gradient-to-b from-gray-100 to-gray-300 px-2 py-0.5 rounded border border-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-black" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clip-rule="evenodd" />
                </svg>
                <input type="range" id="volume-slider" class="w-16 h-1 bg-gray-400 rounded-lg appearance-none cursor-pointer" value="70">
            </div>
        </div>
    </div>

    <div class="bg-white px-8 py-3 shadow-sm border-b border-gray-300 z-10 shrink-0">
        <h1 id="header-part" class="text-[22px] font-bold text-black mb-0.5">Part 1</h1>
        <p class="text-[13px] text-gray-700">Listen and answer questions <span id="header-questions" class="font-bold">1 - 10</span>.</p>
    </div>

    <div class="flex-1 overflow-y-auto bg-[#e6eaf2] p-6 flex justify-center items-start shadow-inner relative" id="test-scroll-area">
        <div class="w-full max-w-[1000px] min-h-full">
            
            <div id="part-1" class="part-section active bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8]">
                
                <div class="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 1-6</div>
                <div class="mb-4 italic text-[15px] text-gray-700">Complete the table below.</div>
                <div class="mb-6 font-bold text-[15px] uppercase">Write ONE WORD AND/OR A NUMBER for each answer.</div>

                <div class="content-box overflow-x-auto">
                    <h2 class="font-bold text-[22px] mb-6 text-center text-black">Oyster Bay Sailing Club Courses</h2>
                    
                    <table class="w-full border-collapse border border-gray-400 text-left mb-8">
                        <thead>
                            <tr class="bg-gray-100">
                                <th class="border border-gray-400 p-3">Name of course</th>
                                <th class="border border-gray-400 p-3">What you learn</th>
                                <th class="border border-gray-400 p-3">Cost</th>
                                <th class="border border-gray-400 p-3">Other information</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="border border-gray-400 p-3 align-top">Taster day</td>
                                <td class="border border-gray-400 p-3 align-top">introduction to sailing</td>
                                <td class="border border-gray-400 p-3 align-top">£120 if booking one place</td>
                                <td class="border border-gray-400 p-3 align-top">small groups (max <span class="font-bold mx-1">1</span><input type="text" placeholder="1" class="ielts-input answer-field" id="q1" data-q="1"> people)</td>
                            </tr>
                            <tr>
                                <td class="border border-gray-400 p-3 align-top">Level 1</td>
                                <td class="border border-gray-400 p-3 align-top">
                                    basic theory e.g. understanding the <span class="font-bold mx-1">2</span><input type="text" placeholder="2" class="ielts-input answer-field" id="q2" data-q="2"> and tides<br><br>
                                    basic sailing skills including <span class="font-bold mx-1">3</span><input type="text" placeholder="3" class="ielts-input answer-field" id="q3" data-q="3"> information
                                </td>
                                <td class="border border-gray-400 p-3 align-top">£200</td>
                                <td class="border border-gray-400 p-3 align-top">
                                    <span class="font-bold mx-1">4</span><input type="text" placeholder="4" class="ielts-input answer-field" id="q4" data-q="4"> available for club members<br><br>
                                    all inclusive (plus a useful <span class="font-bold mx-1">5</span><input type="text" placeholder="5" class="ielts-input answer-field" id="q5" data-q="5">)<br><br>
                                    a <span class="font-bold mx-1">6</span><input type="text" placeholder="6" class="ielts-input answer-field" id="q6" data-q="6"> at the end of the course for all participants
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="border-t border-gray-300 pt-8">
                    <div class="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 7-10</div>
                    <div class="mb-4 italic text-[15px] text-gray-700">Complete the notes below.</div>
                    <div class="mb-6 font-bold text-[15px] uppercase">Write ONE WORD ONLY for each answer.</div>

                    <div class="content-box">
                        <div class="font-bold mb-4 text-[18px] text-blue-900 border-b border-gray-300 pb-2">General information</div>
                        <ul class="list-none space-y-4 mb-8 pl-2">
                            <li>&bull; Participants must be able to swim.</li>
                            <li>&bull; Bring suitable clothing, a <span class="font-bold mx-2">7</span><input type="text" placeholder="7" class="ielts-input answer-field" id="q7" data-q="7"> and toiletries (e.g. shampoo).</li>
                            <li>&bull; There is a <span class="font-bold mx-2">8</span><input type="text" placeholder="8" class="ielts-input answer-field" id="q8" data-q="8"> at the club.</li>
                            <li>&bull; Online training <span class="font-bold mx-2">9</span><input type="text" placeholder="9" class="ielts-input answer-field" id="q9" data-q="9"> are recommended.</li>
                            <li>&bull; <span class="font-bold mx-2">10</span><input type="text" placeholder="10" class="ielts-input answer-field" id="q10" data-q="10"> are available for course participants.</li>
                        </ul>
                    </div>
                </div>

            </div>

            <div id="part-2" class="part-section bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8]">
                <div class="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 11-16</div>
                <div class="mb-6 italic text-[15px] text-gray-700">Choose the correct letter, <span class="font-bold">A, B</span> or <span class="font-bold">C</span>.</div>

                <div class="content-box mb-8">
                    <h2 class="font-bold text-[22px] mb-6 text-center text-black">Working as a makeup trainee</h2>
                    
                    <div class="space-y-8">
                        <div>
                            <div class="font-bold mb-3 flex"><span class="w-8 shrink-0">11</span><span>What should trainees always expect to get when working on low budget short films?</span></div>
                            <div class="pl-8 space-y-1">
                                <label class="mcq-label"><input type="radio" name="q11" value="A" class="mcq-radio answer-field" data-q="11"> <span class="font-bold mr-3">A</span> travel expenses</label>
                                <label class="mcq-label"><input type="radio" name="q11" value="B" class="mcq-radio answer-field" data-q="11"> <span class="font-bold mr-3">B</span> a minimum wage</label>
                                <label class="mcq-label"><input type="radio" name="q11" value="C" class="mcq-radio answer-field" data-q="11"> <span class="font-bold mr-3">C</span> meals</label>
                            </div>
                        </div>

                        <div>
                            <div class="font-bold mb-3 flex"><span class="w-8 shrink-0">12</span><span>According to the speaker, on big budget films trainees may get experience of</span></div>
                            <div class="pl-8 space-y-1">
                                <label class="mcq-label"><input type="radio" name="q12" value="A" class="mcq-radio answer-field" data-q="12"> <span class="font-bold mr-3">A</span> makeup for special effects.</label>
                                <label class="mcq-label"><input type="radio" name="q12" value="B" class="mcq-radio answer-field" data-q="12"> <span class="font-bold mr-3">B</span> working with different ethnicities.</label>
                                <label class="mcq-label"><input type="radio" name="q12" value="C" class="mcq-radio answer-field" data-q="12"> <span class="font-bold mr-3">C</span> creating a variety of hair styles.</label>
                            </div>
                        </div>

                        <div>
                            <div class="font-bold mb-3 flex"><span class="w-8 shrink-0">13</span><span>The speaker says a problem for makeup artists is</span></div>
                            <div class="pl-8 space-y-1">
                                <label class="mcq-label"><input type="radio" name="q13" value="A" class="mcq-radio answer-field" data-q="13"> <span class="font-bold mr-3">A</span> dealing with difficult directors.</label>
                                <label class="mcq-label"><input type="radio" name="q13" value="B" class="mcq-radio answer-field" data-q="13"> <span class="font-bold mr-3">B</span> being shouted at by their supervisor.</label>
                                <label class="mcq-label"><input type="radio" name="q13" value="C" class="mcq-radio answer-field" data-q="13"> <span class="font-bold mr-3">C</span> waiting around for hours doing nothing.</label>
                            </div>
                        </div>

                        <div>
                            <div class="font-bold mb-3 flex"><span class="w-8 shrink-0">14</span><span>How did the speaker feel when she met famous actors for the first time?</span></div>
                            <div class="pl-8 space-y-1">
                                <label class="mcq-label"><input type="radio" name="q14" value="A" class="mcq-radio answer-field" data-q="14"> <span class="font-bold mr-3">A</span> very shy</label>
                                <label class="mcq-label"><input type="radio" name="q14" value="B" class="mcq-radio answer-field" data-q="14"> <span class="font-bold mr-3">B</span> very proud</label>
                                <label class="mcq-label"><input type="radio" name="q14" value="C" class="mcq-radio answer-field" data-q="14"> <span class="font-bold mr-3">C</span> very disappointed</label>
                            </div>
                        </div>
                        
                        <div>
                            <div class="font-bold mb-3 flex"><span class="w-8 shrink-0">15</span><span>What advice does the speaker give about makeup kits?</span></div>
                            <div class="pl-8 space-y-1">
                                <label class="mcq-label"><input type="radio" name="q15" value="A" class="mcq-radio answer-field" data-q="15"> <span class="font-bold mr-3">A</span> Always carry a basic kit with you.</label>
                                <label class="mcq-label"><input type="radio" name="q15" value="B" class="mcq-radio answer-field" data-q="15"> <span class="font-bold mr-3">B</span> Only buy the best products for a makeup kit.</label>
                                <label class="mcq-label"><input type="radio" name="q15" value="C" class="mcq-radio answer-field" data-q="15"> <span class="font-bold mr-3">C</span> Ask other makeup artists to check your kit.</label>
                            </div>
                        </div>

                        <div>
                            <div class="font-bold mb-3 flex"><span class="w-8 shrink-0">16</span><span>What advice does the speaker give about creating a portfolio?</span></div>
                            <div class="pl-8 space-y-1">
                                <label class="mcq-label"><input type="radio" name="q16" value="A" class="mcq-radio answer-field" data-q="16"> <span class="font-bold mr-3">A</span> Keep print and digital photos.</label>
                                <label class="mcq-label"><input type="radio" name="q16" value="B" class="mcq-radio answer-field" data-q="16"> <span class="font-bold mr-3">B</span> Only include a small selection of photos.</label>
                                <label class="mcq-label"><input type="radio" name="q16" value="C" class="mcq-radio answer-field" data-q="16"> <span class="font-bold mr-3">C</span> Get permission to use photos.</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="border-t border-gray-300 pt-8">
                    <div class="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 17-20</div>
                    <div class="mb-4 italic text-[15px] text-gray-700">What ability is required for each of the following duties?</div>
                    <div class="mb-6 font-bold text-[15px] uppercase">Write the correct letter, A, B, or C, next to Questions 17-20.</div>

                    <div class="content-box">
                        <div class="bg-gray-100 p-6 border border-gray-300 mb-8 max-w-[600px] mx-auto">
                            <div class="grid grid-cols-1 gap-y-3 pl-4">
                                <div><span class="font-bold mr-3">A</span> being well-organised</div>
                                <div><span class="font-bold mr-3">B</span> being flexible</div>
                                <div><span class="font-bold mr-3">C</span> working quickly</div>
                            </div>
                        </div>

                        <div class="font-bold mb-4 text-[18px] border-b pb-2 text-center">Duties</div>
                        <div class="space-y-4 max-w-[450px] mx-auto">
                            <div class="flex items-center justify-between"><span class="font-bold w-8">17</span><span class="flex-1">Prepping an actor</span> <input type="text" placeholder="17" class="ielts-input ielts-input-short uppercase answer-field" maxlength="1" id="q17" data-q="17"></div>
                            <div class="flex items-center justify-between"><span class="font-bold w-8">18</span><span class="flex-1">Continuity</span> <input type="text" placeholder="18" class="ielts-input ielts-input-short uppercase answer-field" maxlength="1" id="q18" data-q="18"></div>
                            <div class="flex items-center justify-between"><span class="font-bold w-8">19</span><span class="flex-1">General</span> <input type="text" placeholder="19" class="ielts-input ielts-input-short uppercase answer-field" maxlength="1" id="q19" data-q="19"></div>
                            <div class="flex items-center justify-between"><span class="font-bold w-8">20</span><span class="flex-1">Applying makeup</span> <input type="text" placeholder="20" class="ielts-input ielts-input-short uppercase answer-field" maxlength="1" id="q20" data-q="20"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="part-3" class="part-section bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8]">
                
                <div class="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 21 and 22</div>
                <div class="mb-6 italic text-[15px] text-gray-700">Choose <span class="font-bold">TWO</span> letters, A-E.</div>

                <div class="content-box mb-8">
                    <div class="space-y-4">
                        <div class="font-bold mb-3">Which TWO features of the lecture on ocean biodiversity had the greatest impact on the students?</div>
                        <div class="pl-4 space-y-1 pb-4">
                            <!-- Multi-select checkboxes -->
                            <label class="mcq-label"><input type="checkbox" name="q21_22" value="A" class="mcq-checkbox answer-field"> <span class="font-bold mr-3">A</span> the references to local problems</label>
                            <label class="mcq-label"><input type="checkbox" name="q21_22" value="B" class="mcq-checkbox answer-field"> <span class="font-bold mr-3">B</span> the broad focus of the examples</label>
                            <label class="mcq-label"><input type="checkbox" name="q21_22" value="C" class="mcq-checkbox answer-field"> <span class="font-bold mr-3">C</span> the practical suggestions for solutions</label>
                            <label class="mcq-label"><input type="checkbox" name="q21_22" value="D" class="mcq-checkbox answer-field"> <span class="font-bold mr-3">D</span> the type of issues discussed</label>
                            <label class="mcq-label"><input type="checkbox" name="q21_22" value="E" class="mcq-checkbox answer-field"> <span class="font-bold mr-3">E</span> the implications for government policy</label>
                        </div>
                    </div>
                </div>

                <div class="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 23 and 24</div>
                <div class="mb-6 italic text-[15px] text-gray-700">Choose <span class="font-bold">TWO</span> letters, A-E.</div>

                <div class="content-box mb-8">
                    <div class="space-y-4">
                        <div class="font-bold mb-3">Which TWO details about the research project particularly impressed the students?</div>
                        <div class="pl-4 space-y-1 pb-4">
                            <label class="mcq-label"><input type="checkbox" name="q23_24" value="A" class="mcq-checkbox answer-field"> <span class="font-bold mr-3">A</span> the team's previous successes</label>
                            <label class="mcq-label"><input type="checkbox" name="q23_24" value="B" class="mcq-checkbox answer-field"> <span class="font-bold mr-3">B</span> its wide geographical scale</label>
                            <label class="mcq-label"><input type="checkbox" name="q23_24" value="C" class="mcq-checkbox answer-field"> <span class="font-bold mr-3">C</span> the use of new technology</label>
                            <label class="mcq-label"><input type="checkbox" name="q23_24" value="D" class="mcq-checkbox answer-field"> <span class="font-bold mr-3">D</span> the extensive statistical evidence</label>
                            <label class="mcq-label"><input type="checkbox" name="q23_24" value="E" class="mcq-checkbox answer-field"> <span class="font-bold mr-3">E</span> the large range of specialists involved</label>
                        </div>
                    </div>
                </div>

                <div class="border-t border-gray-300 pt-8">
                    <div class="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 25-30</div>
                    <div class="mb-4 italic text-[15px] text-gray-700">What is the students' opinion of each of the following resources related to ocean biodiversity?</div>
                    <div class="mb-6 font-bold text-[15px] uppercase">Choose SIX answers from the box and write the correct letter, A-H, next to Questions 25-30.</div>

                    <div class="content-box">
                        <div class="bg-gray-100 p-6 border border-gray-300 mb-8 max-w-[600px] mx-auto">
                            <div class="font-bold mb-4 text-center border-b border-gray-300 pb-2 text-[18px]">Opinions</div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-y-3 pl-4">
                                <div><span class="font-bold mr-3">A</span> This is aimed at a very specialist audience.</div>
                                <div><span class="font-bold mr-3">B</span> This is now rather outdated.</div>
                                <div><span class="font-bold mr-3">C</span> This was an effective description of a new danger.</div>
                                <div><span class="font-bold mr-3">D</span> This suggests possible ways to improve the situation.</div>
                                <div><span class="font-bold mr-3">E</span> This does not give a balanced account.</div>
                                <div><span class="font-bold mr-3">F</span> This is too predictable to be useful.</div>
                                <div><span class="font-bold mr-3">G</span> This gives insufficient evidence for its claims.</div>
                                <div><span class="font-bold mr-3">H</span> This gives a clear explanation of the problems.</div>
                            </div>
                        </div>

                        <div class="font-bold mb-4 text-[18px] border-b pb-2 text-center">Resources</div>
                        <div class="space-y-4 max-w-[500px] mx-auto">
                            <div class="flex items-center justify-between"><span class="font-bold w-8">25</span><span class="flex-1">Article on invasive lionfish</span> <input type="text" placeholder="25" class="ielts-input ielts-input-short uppercase answer-field" maxlength="1" id="q25" data-q="25"></div>
                            <div class="flex items-center justify-between"><span class="font-bold w-8">26</span><span class="flex-1">Documentary on microplastics</span> <input type="text" placeholder="26" class="ielts-input ielts-input-short uppercase answer-field" maxlength="1" id="q26" data-q="26"></div>
                            <div class="flex items-center justify-between"><span class="font-bold w-8">27</span><span class="flex-1">Podcast on ocean pollution</span> <input type="text" placeholder="27" class="ielts-input ielts-input-short uppercase answer-field" maxlength="1" id="q27" data-q="27"></div>
                            <div class="flex items-center justify-between"><span class="font-bold w-8">28</span><span class="flex-1">Book on coastal ecosystems</span> <input type="text" placeholder="28" class="ielts-input ielts-input-short uppercase answer-field" maxlength="1" id="q28" data-q="28"></div>
                            <div class="flex items-center justify-between"><span class="font-bold w-8">29</span><span class="flex-1">Article on metal toxicity</span> <input type="text" placeholder="29" class="ielts-input ielts-input-short uppercase answer-field" maxlength="1" id="q29" data-q="29"></div>
                            <div class="flex items-center justify-between"><span class="font-bold w-8">30</span><span class="flex-1">Podcast on floating marine cities</span> <input type="text" placeholder="30" class="ielts-input ielts-input-short uppercase answer-field" maxlength="1" id="q30" data-q="30"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="part-4" class="part-section bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8]">
                <div class="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 31-40</div>
                <div class="mb-4 italic text-[15px] text-gray-700">Complete the notes below.</div>
                <div class="mb-6 font-bold text-[15px] uppercase">Write ONE WORD ONLY for each answer.</div>

                <div class="content-box mb-8">
                    <h2 class="font-bold text-[22px] mb-6 text-center text-black tracking-wide">Sources of rubber</h2>
                    
                    <div class="font-bold mb-2 text-[18px] text-blue-900 border-b border-gray-300 pb-2 mt-4">Three resources which are essential for industrial civilisation</div>
                    <ul class="list-none space-y-4 mb-8 pl-4">
                        <li>&bull; <span class="font-bold mx-2">31</span><input type="text" placeholder="31" class="ielts-input answer-field" id="q31" data-q="31"></li>
                        <li>&bull; fossil fuels</li>
                        <li>&bull; rubber</li>
                    </ul>

                    <div class="font-bold mb-2 text-[18px] text-blue-900 border-b border-gray-300 pb-2">Natural rubber</div>
                    <p class="mb-4 pl-4">This mainly comes from the Pará rubber tree, now cultivated in South-East Asia.</p>
                    <p class="mb-2 pl-4">The supply is limited because</p>
                    <ul class="list-none space-y-4 mb-8 pl-8">
                        <li>&bull; the growth of the tree is <span class="font-bold mx-2">32</span><input type="text" placeholder="32" class="ielts-input answer-field" id="q32" data-q="32"></li>
                        <li>&bull; production cannot easily be adjusted because of increasing or decreasing <span class="font-bold mx-2">33</span><input type="text" placeholder="33" class="ielts-input answer-field" id="q33" data-q="33"></li>
                        <li>&bull; the tree only grows near the <span class="font-bold mx-2">34</span><input type="text" placeholder="34" class="ielts-input answer-field" id="q34" data-q="34"></li>
                        <li>&bull; extracting the latex (rubber) is labour-intensive</li>
                        <li>&bull; it is very difficult to <span class="font-bold mx-2">35</span><input type="text" placeholder="35" class="ielts-input answer-field" id="q35" data-q="35"> rubber after production.</li>
                    </ul>
                    
                    <p class="mb-2 pl-4">New threats include</p>
                    <ul class="list-none space-y-4 mb-8 pl-8">
                        <li>&bull; lack of genetic diversity, leading to danger of disease caused by a <span class="font-bold mx-2">36</span><input type="text" placeholder="36" class="ielts-input answer-field" id="q36" data-q="36"></li>
                        <li>&bull; a shift to the cultivation of palm oil</li>
                        <li>&bull; extreme <span class="font-bold mx-2">37</span><input type="text" placeholder="37" class="ielts-input answer-field" id="q37" data-q="37"> events.</li>
                    </ul>

                    <div class="font-bold mb-2 text-[18px] text-blue-900 border-b border-gray-300 pb-2">Synthetic rubber</div>
                    <ul class="list-none space-y-4 mb-8 pl-4">
                        <li>&bull; may be used for engine parts and cooking utensils</li>
                        <li>&bull; is less <span class="font-bold mx-2">38</span><input type="text" placeholder="38" class="ielts-input answer-field" id="q38" data-q="38"> than natural rubber</li>
                        <li>&bull; is unsuitable for many purposes e.g. the tyres of aircraft.</li>
                    </ul>

                    <div class="font-bold mb-2 text-[18px] text-blue-900 border-b border-gray-300 pb-2">An alternative source of natural rubber</div>
                    <ul class="list-none space-y-4 pl-4">
                        <li>&bull; A wild flower (a type of dandelion) has rubber in its <span class="font-bold mx-2">39</span><input type="text" placeholder="39" class="ielts-input answer-field" id="q39" data-q="39"> .</li>
                        <li>&bull; It can be grown in many locations and does not require good <span class="font-bold mx-2">40</span><input type="text" placeholder="40" class="ielts-input answer-field" id="q40" data-q="40"> .</li>
                    </ul>
                </div>
            </div>

        </div>
    </div>

    <div class="bg-[#e1e5eb] border-t border-gray-300 p-2 flex justify-between items-center shrink-0 shadow-[0_-2px_5px_rgba(0,0,0,0.05)] z-20 overflow-x-auto">
        
        <div class="flex items-center text-[12px] font-bold text-gray-800 ml-4 cursor-pointer shrink-0">
             <input type="checkbox" class="mr-2 w-4 h-4 cursor-pointer" id="review-checkbox"> <label for="review-checkbox" class="cursor-pointer">Review</label>
        </div>
        
        <div class="flex items-center gap-6 mx-auto shrink-0 min-w-max px-4">
            <!-- Nav for Part 1 -->
            <div class="flex items-center cursor-pointer part-nav-header" data-target="1">
                <span class="mr-2 text-[13px] font-bold text-black hover:text-blue-600 transition-colors">Part 1</span>
                <div class="flex gap-0.5">
                    <div class="nav-btn active" data-part="1" data-q="1" id="nav-btn-1">1</div>
                    <div class="nav-btn" data-part="1" data-q="2" id="nav-btn-2">2</div>
                    <div class="nav-btn" data-part="1" data-q="3" id="nav-btn-3">3</div>
                    <div class="nav-btn" data-part="1" data-q="4" id="nav-btn-4">4</div>
                    <div class="nav-btn" data-part="1" data-q="5" id="nav-btn-5">5</div>
                    <div class="nav-btn" data-part="1" data-q="6" id="nav-btn-6">6</div>
                    <div class="nav-btn" data-part="1" data-q="7" id="nav-btn-7">7</div>
                    <div class="nav-btn" data-part="1" data-q="8" id="nav-btn-8">8</div>
                    <div class="nav-btn" data-part="1" data-q="9" id="nav-btn-9">9</div>
                    <div class="nav-btn" data-part="1" data-q="10" id="nav-btn-10">10</div>
                </div>
            </div>

            <!-- Nav for Part 2 -->
            <div class="flex items-center cursor-pointer part-nav-header" data-target="2">
                <span class="mr-2 text-[13px] font-bold text-black hover:text-blue-600 transition-colors">Part 2</span>
                <div class="flex gap-0.5">
                    <div class="nav-btn" data-part="2" data-q="11" id="nav-btn-11">11</div>
                    <div class="nav-btn" data-part="2" data-q="12" id="nav-btn-12">12</div>
                    <div class="nav-btn" data-part="2" data-q="13" id="nav-btn-13">13</div>
                    <div class="nav-btn" data-part="2" data-q="14" id="nav-btn-14">14</div>
                    <div class="nav-btn" data-part="2" data-q="15" id="nav-btn-15">15</div>
                    <div class="nav-btn" data-part="2" data-q="16" id="nav-btn-16">16</div>
                    <div class="nav-btn" data-part="2" data-q="17" id="nav-btn-17">17</div>
                    <div class="nav-btn" data-part="2" data-q="18" id="nav-btn-18">18</div>
                    <div class="nav-btn" data-part="2" data-q="19" id="nav-btn-19">19</div>
                    <div class="nav-btn" data-part="2" data-q="20" id="nav-btn-20">20</div>
                </div>
            </div>

            <!-- Nav for Part 3 -->
            <div class="flex items-center cursor-pointer part-nav-header" data-target="3">
                <span class="mr-2 text-[13px] font-bold text-black hover:text-blue-600 transition-colors">Part 3</span>
                <div class="flex gap-0.5">
                    <div class="nav-btn" data-part="3" data-q="21" id="nav-btn-21">21</div>
                    <div class="nav-btn" data-part="3" data-q="22" id="nav-btn-22">22</div>
                    <div class="nav-btn" data-part="3" data-q="23" id="nav-btn-23">23</div>
                    <div class="nav-btn" data-part="3" data-q="24" id="nav-btn-24">24</div>
                    <div class="nav-btn" data-part="3" data-q="25" id="nav-btn-25">25</div>
                    <div class="nav-btn" data-part="3" data-q="26" id="nav-btn-26">26</div>
                    <div class="nav-btn" data-part="3" data-q="27" id="nav-btn-27">27</div>
                    <div class="nav-btn" data-part="3" data-q="28" id="nav-btn-28">28</div>
                    <div class="nav-btn" data-part="3" data-q="29" id="nav-btn-29">29</div>
                    <div class="nav-btn" data-part="3" data-q="30" id="nav-btn-30">30</div>
                </div>
            </div>
            
            <!-- Nav for Part 4 -->
            <div class="flex items-center cursor-pointer part-nav-header" data-target="4">
                <span class="mr-2 text-[13px] font-bold text-black hover:text-blue-600 transition-colors">Part 4</span>
                <div class="flex gap-0.5">
                    <div class="nav-btn" data-part="4" data-q="31" id="nav-btn-31">31</div>
                    <div class="nav-btn" data-part="4" data-q="32" id="nav-btn-32">32</div>
                    <div class="nav-btn" data-part="4" data-q="33" id="nav-btn-33">33</div>
                    <div class="nav-btn" data-part="4" data-q="34" id="nav-btn-34">34</div>
                    <div class="nav-btn" data-part="4" data-q="35" id="nav-btn-35">35</div>
                    <div class="nav-btn" data-part="4" data-q="36" id="nav-btn-36">36</div>
                    <div class="nav-btn" data-part="4" data-q="37" id="nav-btn-37">37</div>
                    <div class="nav-btn" data-part="4" data-q="38" id="nav-btn-38">38</div>
                    <div class="nav-btn" data-part="4" data-q="39" id="nav-btn-39">39</div>
                    <div class="nav-btn" data-part="4" data-q="40" id="nav-btn-40">40</div>
                </div>
            </div>
        </div>

        <div class="mr-4 shrink-0 flex gap-2">
            <button id="submit-btn" onclick="submitTest()" class="hidden bg-green-600 text-white px-4 py-1.5 rounded text-sm font-bold shadow hover:bg-green-700 transition">
                Submit Test
            </button>
            <button id="next-btn" class="w-8 h-8 rounded-full bg-gradient-to-b from-white to-gray-200 border border-gray-400 shadow flex items-center justify-center hover:from-gray-100 hover:to-gray-300 transition text-lg font-bold pb-1 text-gray-700" onclick="nextPart()">
                &rarr;
            </button>
        </div>
    </div>

    <!-- Answer Sheet Modal -->
    <div id="answer-sheet-modal" class="fixed inset-0 bg-gray-800 bg-opacity-80 z-[100] hidden flex flex-col items-center py-10 overflow-y-auto font-[Arial]">
        <div class="bg-white max-w-[900px] w-full p-4 shadow-2xl relative min-h-[900px] border border-gray-300">
            <button class="absolute top-2 right-4 text-3xl font-bold text-gray-500 hover:text-black" onclick="document.getElementById('answer-sheet-modal').classList.add('hidden')">&times;</button>
            
            <h2 class="text-center text-[22px] font-bold mb-4 mt-2 tracking-wide text-green-700">IELTS Listening Score Report</h2>
            
            <div class="flex items-start mb-2">
                <div class="w-[60px] h-[80px] bg-black p-1 mr-4 flex flex-col justify-between">
                    <div class="w-full bg-white h-[2px]"></div><div class="w-full bg-white h-[1px]"></div><div class="w-full bg-white h-[3px]"></div>
                    <div class="w-full bg-white h-[1px]"></div><div class="w-full bg-white h-[4px]"></div><div class="w-full bg-white h-[2px]"></div>
                    <div class="w-full bg-white h-[1px]"></div><div class="w-full bg-white h-[2px]"></div><div class="w-full bg-white h-[3px]"></div><div class="w-full bg-white h-[1px]"></div>
                </div>

                <div class="flex-1 text-sm">
                    <div class="flex items-center mb-2">
                        <div class="w-24 font-bold text-[13px] leading-tight">Candidate<br>Name</div>
                        <div id="sheet-candidate-name" class="flex-1 border-2 border-black h-8 px-2 uppercase font-bold text-lg text-blue-900 flex items-center"></div>
                    </div>
                    <div class="flex items-center">
                        <div class="w-24 font-bold text-[13px] leading-tight">Candidate<br>No.</div>
                        <div class="flex border-2 border-black mr-6 h-8">
                            <div class="w-6 border-r-2 border-black text-center font-bold flex items-center justify-center">1</div>
                            <div class="w-6 border-r-2 border-black text-center font-bold flex items-center justify-center">2</div>
                            <div class="w-6 border-r-2 border-black text-center font-bold flex items-center justify-center">3</div>
                            <div class="w-6 border-r-2 border-black text-center font-bold flex items-center justify-center">4</div>
                            <div class="w-6 border-r-2 border-black text-center font-bold flex items-center justify-center">5</div>
                            <div class="w-6 text-center font-bold flex items-center justify-center">6</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-[#0b6e3f] text-white font-bold px-2 py-1 flex justify-between text-lg mb-2">
                <span>Listening</span><span>Listening</span><span>Listening</span><span>Listening</span><span>Listening</span><span>Listening</span>
            </div>

            <div class="grid grid-cols-2 gap-x-8 gap-y-1" id="sheet-grid">
                <!-- Javascript will populate 40 rows here -->
            </div>

            <div class="mt-6 flex border-2 border-black">
                <div class="w-32 border-r-2 border-black p-1 text-[11px] leading-tight">Marker 2<br>Signature:</div>
                <div class="flex-1 border-r-2 border-black"></div>
                <div class="w-32 border-r-2 border-black p-1 text-[11px] leading-tight">Marker 1<br>Signature:</div>
                <div class="flex-1 border-r-2 border-black"></div>
                
                <div class="w-32 border-r-2 border-black p-1 text-sm flex items-center justify-end pr-2 font-bold bg-gray-100">Listening Total:</div>
                <div class="w-20 border-r-2 border-black flex items-center justify-center font-bold text-xl text-blue-900" id="final-total-score">0 / 40</div>
                
                <div class="w-32 border-r-2 border-black p-1 text-sm flex items-center justify-end pr-2 font-bold bg-green-100">Band Score:</div>
                <div class="w-20 flex items-center justify-center font-bold text-2xl text-green-800" id="final-band-score">0.0</div>
            </div>
        </div>
    </div>

    <audio id="test-audio" src="https://drive.google.com/uc?export=download&id=10kSpYtnGZN_gU3JsdiA-hnt_BkEtc2dH" preload="none"></audio>

    <script>
        // --- Timer Variables ---
        let totalSeconds = 40 * 60; // 40 minutes
        let timerInterval;

        // --- Audio Variables ---
        const audioElement = document.getElementById('test-audio');
        const playIcon = document.getElementById('play-icon');
        const pauseIcon = document.getElementById('pause-icon');
        const playText = document.getElementById('play-text');
        const volumeSlider = document.getElementById('volume-slider');
        const audioErrorText = document.getElementById('audio-error');

        audioElement.volume = volumeSlider.value / 100;
        volumeSlider.addEventListener('input', function() { audioElement.volume = this.value / 100; });

        function toggleAudio() {
            if (audioElement.paused) {
                const playPromise = audioElement.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        playIcon.classList.add('hidden');
                        pauseIcon.classList.remove('hidden');
                        playText.textContent = "Pause";
                        audioErrorText.classList.add('hidden');
                    }).catch(error => {
                        console.error("Audio playback failed:", error);
                        audioErrorText.classList.remove('hidden');
                        audioErrorText.textContent = "Failed to load audio from Drive.";
                        pauseIcon.classList.add('hidden');
                        playIcon.classList.remove('hidden');
                        playText.textContent = "Play";
                    });
                }
            } else {
                audioElement.pause();
                pauseIcon.classList.add('hidden');
                playIcon.classList.remove('hidden');
                playText.textContent = "Play";
            }
        }
        
        audioElement.addEventListener('ended', function() {
            pauseIcon.classList.add('hidden');
            playIcon.classList.remove('hidden');
            playText.textContent = "Play";
        });

        // --- Start Screen ---
        function startTest() {
            const nameInput = document.getElementById('candidate-name-input').value.trim();
            const errorMsg = document.getElementById('name-error');
            if(!nameInput) { errorMsg.classList.remove('hidden'); return; }
            errorMsg.classList.add('hidden');
            
            document.getElementById('display-candidate-name').textContent = nameInput.toUpperCase();
            document.getElementById('sheet-candidate-name').textContent = nameInput.toUpperCase();
            document.getElementById('intro-screen').classList.add('hidden');
            startTimer();
        }

        function updateTimerDisplay() {
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            document.getElementById('timer-display').textContent = \`\${minutes.toString().padStart(2, '0')}:\${seconds.toString().padStart(2, '0')}\`;
        }

        function startTimer() {
            updateTimerDisplay();
            timerInterval = setInterval(() => {
                totalSeconds--;
                if(totalSeconds <= 0) {
                    clearInterval(timerInterval);
                    totalSeconds = 0;
                    submitTest();
                }
                updateTimerDisplay();
            }, 1000);
        }

        // --- Official Answer Key ---
        const answerKey = {
            1: ['10', 'ten'], 2: ['weather'], 3: ['safety'], 4: ['discount'], 5: ['dictionary'], 6: ['certificate'], 7: ['towel'], 8: ['café', 'cafe'], 9: ['videos'], 10: ['lockers'],
            11: ['a'], 12: ['b'], 13: ['a'], 14: ['a'], 15: ['a'], 16: ['c'], 17: ['c'], 18: ['a'], 19: ['b'], 20: ['c'],
            21: ['b', 'd'], 22: ['b', 'd'], 23: ['c', 'e'], 24: ['c', 'e'], 25: ['g'], 26: ['b'], 27: ['f'], 28: ['h'], 29: ['a'], 30: ['e'],
            31: ['metal', 'metals'], 32: ['slow'], 33: ['demand'], 34: ['equator'], 35: ['recycle'], 36: ['fungus'], 37: ['weather'], 38: ['strong'], 39: ['roots'], 40: ['soil']
        };

        // --- Band Score Calculation ---
        function getBandScore(score) {
            if (score >= 39) return "9.0";
            if (score >= 37) return "8.5";
            if (score >= 35) return "8.0";
            if (score >= 32) return "7.5";
            if (score >= 30) return "7.0";
            if (score >= 26) return "6.5";
            if (score >= 23) return "6.0";
            if (score >= 20) return "5.5";
            if (score >= 16) return "5.0";
            if (score >= 13) return "4.5";
            if (score >= 10) return "4.0";
            if (score >= 8) return "3.5";
            if (score >= 6) return "3.0";
            if (score >= 4) return "2.5";
            return "0.0";
        }

        function submitTest() {
            clearInterval(timerInterval);
            
            let userAnswers = {};
            
            // Checkbox multi-select logic for Q21-24
            const cb21_22 = document.querySelectorAll('input[name="q21_22"]:checked');
            const cb23_24 = document.querySelectorAll('input[name="q23_24"]:checked');
            
            // Collect all user answers
            for(let i=1; i<=40; i++) {
                if (i === 21) { userAnswers[i] = cb21_22[0] ? cb21_22[0].value.toLowerCase() : ''; continue; }
                if (i === 22) { userAnswers[i] = cb21_22[1] ? cb21_22[1].value.toLowerCase() : ''; continue; }
                if (i === 23) { userAnswers[i] = cb23_24[0] ? cb23_24[0].value.toLowerCase() : ''; continue; }
                if (i === 24) { userAnswers[i] = cb23_24[1] ? cb23_24[1].value.toLowerCase() : ''; continue; }

                const textInput = document.getElementById('q' + i);
                if (textInput) {
                    userAnswers[i] = textInput.value.trim().toLowerCase();
                } else {
                    const radios = document.querySelectorAll(\`input[name="q\${i}"]:checked\`);
                    if (radios.length > 0) userAnswers[i] = radios[0].value.toLowerCase();
                    else userAnswers[i] = '';
                }
            }

            // Build grid and calculate total score
            let col1Html = '<div class="space-y-1">';
            let col2Html = '<div class="space-y-1">';
            let totalScore = 0;

            for(let i=1; i<=40; i++) {
                let uAns = userAnswers[i];
                let isCorrect = false;
                let displayAns = "";

                let acceptable = answerKey[i] || [];
                
                // Allow order independence for 21/22 and 23/24
                if ((i === 21 || i === 22) && uAns !== '') {
                    if (answerKey[21].includes(uAns) || answerKey[22].includes(uAns)) isCorrect = true;
                } else if ((i === 23 || i === 24) && uAns !== '') {
                    if (answerKey[23].includes(uAns) || answerKey[24].includes(uAns)) isCorrect = true;
                } else if (acceptable.includes(uAns) && uAns !== '') {
                    isCorrect = true;
                }
                
                displayAns = acceptable.length > 0 ? acceptable[0].toUpperCase() : "[KEY MISSING]";

                if (isCorrect) totalScore++;

                // Format row
                let ansDisplayHtml = "";
                if (isCorrect) {
                    ansDisplayHtml = \`<span class="text-green-700 font-bold uppercase">\${uAns}</span>\`;
                } else {
                    let crossedOut = uAns ? \`<span class="text-red-500 line-through mr-2 uppercase">\${uAns}</span>\` : \`<span class="text-red-500 italic mr-2 text-xs">(blank)</span>\`;
                    ansDisplayHtml = \`\${crossedOut} <span class="text-green-700 font-bold ml-1">\${displayAns}</span>\`;
                }

                const rowHtml = \`
                    <div class="flex items-stretch h-[26px]">
                        <div class="bg-black text-white font-bold w-7 flex items-center justify-center text-sm">\${i}</div>
                        <div class="flex-1 border-2 border-black ml-1 px-2 flex items-center text-sm overflow-hidden whitespace-nowrap">
                            \${ansDisplayHtml}
                        </div>
                    </div>
                \`;
                
                if (i <= 20) col1Html += rowHtml;
                else col2Html += rowHtml;
            }
            
            col1Html += '</div>'; col2Html += '</div>';
            document.getElementById('sheet-grid').innerHTML = col1Html + col2Html;
            
            // Update Footer Scores
            document.getElementById('final-total-score').textContent = \`\${totalScore} / 40\`;
            document.getElementById('final-band-score').textContent = getBandScore(totalScore);

            document.getElementById('answer-sheet-modal').classList.remove('hidden');
        }

        // --- UI Interactions & Navigation Logic ---
        function updateAnswerStatus(qNumber, hasValue) {
            const navButton = document.getElementById('nav-btn-' + qNumber);
            if (navButton) {
                if (hasValue) navButton.classList.add('answered');
                else navButton.classList.remove('answered');
            }
        }

        document.querySelectorAll('.ielts-input.answer-field').forEach(input => {
            input.addEventListener('input', function() {
                const qNumber = this.getAttribute('data-q');
                if (this.value.trim() !== '') {
                    this.classList.add('active-state');
                    updateAnswerStatus(qNumber, true);
                } else {
                    this.classList.remove('active-state');
                    updateAnswerStatus(qNumber, false);
                }
            });
        });

        document.querySelectorAll('.mcq-radio.answer-field').forEach(radio => {
            radio.addEventListener('change', function() {
                const qNumber = this.getAttribute('data-q');
                if (this.checked) updateAnswerStatus(qNumber, true);
            });
        });
        
        // Multi-select Checkboxes logic (Updating Nav Toolbar visually)
        document.querySelectorAll('.mcq-checkbox.answer-field').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const groupName = this.getAttribute('name');
                const checkedCount = document.querySelectorAll(\`input[name="\${groupName}"]:checked\`).length;
                if (groupName === 'q21_22') {
                    updateAnswerStatus('21', checkedCount >= 1);
                    updateAnswerStatus('22', checkedCount >= 2);
                } else if (groupName === 'q23_24') {
                    updateAnswerStatus('23', checkedCount >= 1);
                    updateAnswerStatus('24', checkedCount >= 2);
                }
            });
        });

        // Navigation Logic
        const navBtns = document.querySelectorAll('.nav-btn');
        const partSections = document.querySelectorAll('.part-section');
        const headerPart = document.getElementById('header-part');
        const headerQuestions = document.getElementById('header-questions');
        const scrollArea = document.getElementById('test-scroll-area');
        let currentPartIndex = 1;

        const partQuestionRanges = { 1: "1 - 10", 2: "11 - 20", 3: "21 - 30", 4: "31 - 40" };

        function switchPart(partNumber) {
            currentPartIndex = parseInt(partNumber);
            partSections.forEach(section => section.classList.remove('active'));
            document.getElementById('part-' + partNumber).classList.add('active');
            headerPart.textContent = 'Part ' + partNumber;
            headerQuestions.textContent = partQuestionRanges[partNumber];

            if (currentPartIndex === 4) {
                document.getElementById('next-btn').classList.add('hidden');
                document.getElementById('submit-btn').classList.remove('hidden');
            } else {
                document.getElementById('next-btn').classList.remove('hidden');
                document.getElementById('submit-btn').classList.add('hidden');
            }
            if(scrollArea) scrollArea.scrollTop = 0;
        }

        navBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                navBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const targetPart = this.getAttribute('data-part');
                switchPart(targetPart);
                
                // Focus element if it's a standard text input
                const targetQ = this.getAttribute('data-q');
                const inputToFocus = document.getElementById('q' + targetQ);
                if(inputToFocus) setTimeout(() => inputToFocus.focus(), 50); 
            });
        });

        document.querySelectorAll('.part-nav-header').forEach(header => {
            header.addEventListener('click', function(e) {
                if(e.target.classList.contains('nav-btn')) return;
                const targetPart = this.getAttribute('data-target');
                const firstBtnOfPart = document.querySelector(\`.nav-btn[data-part="\${targetPart}"]\`);
                if(firstBtnOfPart) {
                    navBtns.forEach(b => b.classList.remove('active'));
                    firstBtnOfPart.classList.add('active');
                }
                switchPart(targetPart);
            });
        });

        function nextPart() {
            if(currentPartIndex < 4) {
                const next = currentPartIndex + 1;
                const firstBtnOfNextPart = document.querySelector(\`.nav-btn[data-part="\${next}"]\`);
                if(firstBtnOfNextPart) firstBtnOfNextPart.click();
            }
        }
    </script>
</body>
</html>
`;

// Create directory
const dir = path.join(__dirname, 'public/IELTS_Listening_Jan');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}
fs.writeFileSync(path.join(dir, 'index.html'), htmlContent);

// 2. Update PracticeTests.tsx to use this html for id === 2
const ptPath = path.join(__dirname, 'src/pages/PracticeTests.tsx');
let ptContent = fs.readFileSync(ptPath, 'utf8');

ptContent = ptContent.replace(
    /if \(courseName === 'IELTS'\) {[\s\S]*?if \(testId === 21\) {[\s\S]*?externalLink = `\/test\/reading\/21`;[\s\S]*?}[\s\S]*?}/,
    `if (courseName === 'IELTS') {
        if (testId === 2) {
           externalLink = '/IELTS_Listening_Jan/index.html';
        }
        if (testId === 21) {
           externalLink = \`/test/reading/21\`;
        }
      }`
);

// Remove 2 from the array in PracticeTests so it uses externalLink branch
ptContent = ptContent.replace(
    "[1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 13, 14, 17, 21, 'IELTS-READING-JAN2026-001']",
    "[1, 3, 4, 5, 6, 7, 9, 10, 11, 13, 14, 17, 21, 'IELTS-READING-JAN2026-001']"
);

fs.writeFileSync(ptPath, ptContent);

// 3. Update CourseDetails.tsx for link to point to this embed
const cdPath = path.join(__dirname, 'src/pages/CourseDetails.tsx');
let cdContent = fs.readFileSync(cdPath, 'utf8');
cdContent = cdContent.replace(
    "link: '/test/listening/2'",
    "link: '/test/embed?src=%2FIELTS_Listening_Jan%2Findex.html'"
);
fs.writeFileSync(cdPath, cdContent);

