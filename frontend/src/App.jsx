import { useState } from 'react'
import confetti from 'canvas-confetti'
import './index.css'

function App() {
    const [budget, setBudget] = useState(1500)
    const [days, setDays] = useState(3)
    const [interests, setInterests] = useState(["Casinos"])
    const [loading, setLoading] = useState(false)
    const [itinerary, setItinerary] = useState(null)
    const [error, setError] = useState(null)

    // New State for alternatives
    const [alternatives, setAlternatives] = useState([])
    const [loadingAlts, setLoadingAlts] = useState(false)

    const interestOptions = ["Casinos", "Shows", "Fine Dining", "Nightlife", "Sightseeing"]

    const toggleInterest = (i) => {
        if (interests.includes(i)) setInterests(interests.filter(item => item !== i))
        else setInterests([...interests, i])
    }

    const triggerConfetti = () => {
        const duration = 3500;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 100, zIndex: 0, scalar: 1.8, colors: ['#f59e0b', '#3b82f6', '#ffffff'] };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 20 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    };

    const generateTrip = async () => {
        setLoading(true)
        setError(null)
        setItinerary(null)
        setAlternatives([])
        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ budget, days, interests })
            })
            
            const textResponse = await res.text()
            let data;
            try {
                data = JSON.parse(textResponse)
            } catch(e) {
                throw new Error("Cannot connect to server. Did you remember to start the FastAPI backend server?")
            }
            
            if (!res.ok) throw new Error(data.detail || "Failed to generate")
            if (data.error) throw new Error(data.error)
            setItinerary(data)
            triggerConfetti()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const fetchAlternatives = async () => {
        if(!itinerary) return;
        setLoadingAlts(true);
        try {
            const currentPlaces = [];
            itinerary.itinerary.forEach(day => {
                day.activities.forEach(act => currentPlaces.push(act.name));
            });

            const remaining = budget - itinerary.total_cost;
            const res = await fetch("/api/alternatives", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ remaining_budget: remaining, interests, current_places: currentPlaces })
            });
            const data = await res.json();
            setAlternatives(data.alternatives || []);
        } catch(err) {
            console.error(err);
        } finally {
            setLoadingAlts(false);
        }
    };

    const addAlternative = (alt, dayIndex) => {
        const newItinerary = {...itinerary};
        if (!newItinerary.itinerary[dayIndex]) return;
        newItinerary.itinerary[dayIndex].activities.push({
            name: alt.name, cost: alt.cost, description: alt.description, time: alt.time || "Flexible", distance: alt.distance, cab_fare: alt.cab_fare
        });
        newItinerary.total_cost += alt.cost;
        setItinerary(newItinerary);
        setAlternatives(alternatives.filter(a => a.name !== alt.name));
        
        triggerConfetti();
    };

    const removeActivity = (dayIndex, actIndex, cost) => {
        const newItinerary = {...itinerary};
        const removedAct = newItinerary.itinerary[dayIndex].activities[actIndex];
        newItinerary.itinerary[dayIndex].activities.splice(actIndex, 1);
        newItinerary.total_cost -= cost;
        setItinerary(newItinerary);
        setAlternatives([...alternatives, removedAct]);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-[1400px] fade-in relative">
            {/* Ambient Vegas Sign Graphic */}
            <img 
                src="/vegas-sign.png" 
                alt="" 
                className="absolute top-8 right-6 md:right-12 w-48 md:w-72 mix-blend-multiply opacity-90 z-0 pointer-events-none hidden sm:block fade-in drop-shadow-sm" 
            />
            <header className="text-center mb-12">
                <h1 className="text-5xl font-light tracking-tight text-gray-900 mb-3 items-center justify-center flex gap-3">
                    SinCity <span className="font-bold text-gold-500">AI</span>
                </h1>
                <p className="text-lg text-gray-500 font-light">Intelligent Las Vegas Trip Optimizer</p>
            </header>

            <div className="grid md:grid-cols-12 gap-8">
                {/* Configuration Panel */}
                <div className="md:col-span-3 space-y-6 glass-panel p-6 self-start">
                    <h2 className="text-xl font-semibold mb-4">Plan Your Trip</h2>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Total Budget ($)</label>
                        <input type="number" 
                            className="w-full bg-white bg-opacity-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
                            value={budget} onChange={(e)=>setBudget(Number(e.target.value))} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Days)</label>
                        <input type="number" 
                            className="w-full bg-white bg-opacity-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
                            value={days} onChange={(e)=>setDays(Number(e.target.value))} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Interests</label>
                        <div className="flex flex-wrap gap-2">
                            {interestOptions.map(opt => (
                                <button key={opt}
                                    onClick={() => toggleInterest(opt)}
                                    className={`px-3 py-1.5 rounded-full text-xs transition-all duration-200 ${
                                        interests.includes(opt) 
                                        ? 'bg-gold-500 text-white shadow-md' 
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                    }`}>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={generateTrip} 
                        disabled={loading || interests.length === 0}
                        className="w-full mt-2 bg-gray-900 hover:bg-gray-800 text-gold-400 font-semibold py-3 rounded-xl transition duration-300 shadow-lg disabled:opacity-50 flex justify-center items-center">
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gold-series"></div>
                        ) : "Optimize"}
                    </button>
                    {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
                </div>

                {/* Results Panel */}
                <div className="md:col-span-6 min-h-[500px]">
                    {!itinerary && !loading && (
                        <div className="h-full min-h-[300px] flex items-center justify-center glass-panel p-8 text-gray-400 text-center">
                            Set your preferences and click Optimize to generate a hyper-personalized Vegas experience.
                        </div>
                    )}

                    {loading && (
                        <div className="h-full min-h-[300px] flex flex-col items-center justify-center glass-panel p-8">
                            <div className="animate-pulse flex flex-col items-center">
                                <div className="h-12 w-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                                <p className="text-lg text-gray-600">Retrieving venues & calculating budget...</p>
                            </div>
                        </div>
                    )}

                    {itinerary && !loading && (
                        <div className="space-y-6 fade-in">
                            <div className="glass-panel p-6 flex justify-between items-center text-white bg-gray-900">
                                <div>
                                    <p className="text-gold-400 text-xs font-semibold uppercase tracking-wider mb-1">Estimated Total Cost</p>
                                    <h2 className="text-3xl font-light text-blue-400">${itinerary.total_cost}</h2>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Remaining Buffer</p>
                                    <h2 className="text-xl font-light text-green-400">${budget - itinerary.total_cost}</h2>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                {itinerary.itinerary?.map((dayPlan, dayIdx) => (
                                    <div key={dayIdx} className="glass-panel p-6 overflow-hidden relative">
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gold-400"></div>
                                        <h3 className="text-xl font-light mb-4">Day {dayPlan.day}</h3>
                                        <div className="space-y-6">
                                            {dayPlan.activities?.map((act, actIdx) => (
                                                <div key={actIdx} className="flex gap-4 items-start relative group">
                                                    <div className="w-20 shrink-0 mt-1">
                                                        <span className="bg-gray-100 text-gray-600 text-[9px] font-bold px-2 py-1.5 rounded-lg uppercase tracking-wider inline-block text-center border border-gray-200">
                                                            {act.time.split('/').map((t, index, array) => (
                                                                <span key={index}>
                                                                    {t}
                                                                    {index < array.length - 1 && <br />}
                                                                </span>
                                                            ))}
                                                        </span>
                                                    </div>
                                                    <div className="w-full pr-8">
                                                        <h4 className="text-md font-medium text-gray-900"><a href={`https://www.google.com/search?q=${encodeURIComponent(act.name + ' Las Vegas')}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline transition-colors">{act.name}</a> <span className="text-gold-600 text-xs ml-2">${act.cost}</span></h4>
                                                        <p className="text-gray-500 text-sm mt-1">{act.description}</p>
                                                        {(act.distance || act.cab_fare) && (
                                                            <div className="mt-2 flex items-center text-[10px] font-medium text-gray-500 bg-gray-50 rounded-md px-2 py-1.5 w-max border border-gray-100 flex-wrap gap-2">
                                                                <div className="flex items-center">
                                                                    <svg className="w-3 h-3 mr-1 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                                    <span>Est. Transit: {act.distance || 'Nearby'} &bull; Cab Fare: {act.cab_fare || 'N/A'} (Not included)</span>
                                                                </div>
                                                                {(act.cab_fare && act.cab_fare !== 'N/A') && (
                                                                    <a href={`https://m.uber.com/ul/?action=setPickup&${actIdx > 0 ? 'pickup[formatted_address]=' + encodeURIComponent(dayPlan.activities[actIdx - 1].name + ', Las Vegas, NV') : 'pickup=my_location'}&dropoff[formatted_address]=${encodeURIComponent(act.name + ', Las Vegas, NV')}`}
                                                                       target="_blank" rel="noopener noreferrer"
                                                                       className="bg-gray-900 text-white px-2 py-1 rounded shadow-sm hover:bg-gold-500 transition-colors flex items-center">
                                                                       Book Uber
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Remove Button */}
                                                    <button 
                                                        onClick={() => removeActivity(dayIdx, actIdx, act.cost)}
                                                        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Alternatives Sidebar */}
                <div className="md:col-span-3 space-y-4 self-start md:mt-24">
                    {itinerary && !loading && (
                        <div className="glass-panel p-6 fade-in">
                            <h2 className="text-lg font-semibold mb-2">More Ideas</h2>
                            <p className="text-xs text-gray-500 mb-4">Have some extra budget? Find more places that fit your limit to add to your trip.</p>
                            
                            <button 
                                onClick={fetchAlternatives}
                                disabled={loadingAlts}
                                className="w-full mb-4 bg-white border border-gold-500 text-gold-600 hover:bg-gold-50 text-sm font-medium py-2 rounded-lg transition disabled:opacity-50 flex items-center justify-center">
                                {loadingAlts ? "Searching..." : "Find More Places"}
                            </button>

                            <div className="space-y-4">
                                {alternatives.map((alt, idx) => {
                                    const remaining = budget - itinerary.total_cost;
                                    const isOver = alt.cost > remaining;

                                    let suggestionText = "";
                                    if (isOver) {
                                        const allActs = [];
                                        itinerary.itinerary.forEach((d) => d.activities.forEach((a) => allActs.push(a)));
                                        const sortedActs = [...allActs].sort((a,b) => a.cost - b.cost);
                                        
                                        const deficit = alt.cost - remaining;
                                        const toRemove = sortedActs.find(a => a.cost >= deficit);
                                        const toKeep = sortedActs[sortedActs.length - 1]; // highly rated
                                        
                                        if (toRemove && toKeep && toRemove.name !== toKeep.name) {
                                            suggestionText = `Exceeds budget! Remove '${toRemove.name}' to afford this. (Keep '${toKeep.name}', it's highly entertaining!)`;
                                        } else {
                                            suggestionText = "Exceeds budget! Remove an activity to make room.";
                                        }
                                    }

                                    return (
                                        <div key={idx} className={`p-4 rounded-xl border relative ${isOver ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
                                            <h4 className={`text-sm font-medium pr-6 ${isOver ? 'text-red-900' : 'text-gray-900'}`}><a href={`https://www.google.com/search?q=${encodeURIComponent(alt.name + ' Las Vegas')}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline transition-colors">{alt.name}</a></h4>
                                            <p className={`text-sm font-semibold mt-0.5 ${isOver ? 'text-red-600' : 'text-gold-600'}`}>${alt.cost}</p>
                                            <p className={`text-xs mt-2 line-clamp-3 mb-3 ${isOver ? 'text-red-700' : 'text-gray-500'}`}>{alt.description}</p>
                                            
                                            {isOver ? (
                                                <div className="bg-red-100 text-red-800 text-[10px] p-2 rounded leading-tight font-medium">
                                                    {suggestionText}
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <select 
                                                        id={`select-${idx}`}
                                                        className="text-xs border border-gray-300 rounded px-2 py-1 bg-white flex-1"
                                                        defaultValue={0}>
                                                        {itinerary.itinerary.map((d, i) => (
                                                            <option key={i} value={i}>Day {d.day}</option>
                                                        ))}
                                                    </select>
                                                    <button 
                                                        onClick={() => {
                                                            const selDayIndex = parseInt(document.getElementById(`select-${idx}`).value);
                                                            addAlternative(alt, selDayIndex);
                                                        }}
                                                        className="bg-gray-900 hover:bg-gray-800 text-white text-xs px-3 py-1 rounded">
                                                        Add +
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {alternatives.length === 0 && !loadingAlts && (
                                    <div className="text-center text-gray-400 text-sm py-4 border-2 border-dashed border-gray-100 rounded-xl">
                                        No alternatives loaded yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}

export default App
