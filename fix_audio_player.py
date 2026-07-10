import sys

with open("src/components/CustomAudioPlayer.tsx", "r") as f:
    content = f.read()

content = content.replace("interface CustomAudioPlayerProps {", "interface CustomAudioPlayerProps {\n  isMockMode?: boolean;")
content = content.replace("({ src }, ref) => {", "({ src, isMockMode }, ref) => {")

toggle_play_pause_old = """  const togglePlayPause = () => {
    const audio = innerAudioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };"""

toggle_play_pause_new = """  const togglePlayPause = () => {
    const audio = innerAudioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      if (isMockMode) return; // Cannot pause in mock mode
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };"""

content = content.replace(toggle_play_pause_old, toggle_play_pause_new)

play_pause_btn_old = """      <button 
        onClick={togglePlayPause}
        className="w-12 h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors shrink-0 shadow-md"
      >"""
play_pause_btn_new = """      <button 
        onClick={togglePlayPause}
        disabled={isMockMode && isPlaying}
        className={`w-12 h-12 flex items-center justify-center text-white rounded-full transition-colors shrink-0 shadow-md ${isMockMode && isPlaying ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
      >"""
content = content.replace(play_pause_btn_old, play_pause_btn_new)

range_old = """        <input 
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleProgressChange}
          className="flex-1 h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />"""
range_new = """        <input 
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleProgressChange}
          disabled={isMockMode}
          className={`flex-1 h-2.5 bg-gray-200 rounded-lg appearance-none accent-blue-600 ${isMockMode ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        />"""
content = content.replace(range_old, range_new)

with open("src/components/CustomAudioPlayer.tsx", "w") as f:
    f.write(content)
