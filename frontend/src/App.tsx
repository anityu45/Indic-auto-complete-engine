import KeyboardPage from './pages/KeyboardPage'

function App() {
  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      <header className="px-6 py-4 bg-black text-center flex-shrink-0">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">AutoComplete Demo</h1>
      </header>
      <main className="flex-1 flex items-center justify-center w-full px-4 overflow-auto">
        <KeyboardPage />
      </main>
    </div>
  )
}

export default App
