import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import RecipeList from './components/RecipeList'
import RecipeDetail from './components/RecipeDetail'
import RecipeForm from './components/RecipeForm'
import Home from './pages/Home'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/recipes" element={<RecipeList />} />
        <Route path="/recipes/new" element={<RecipeForm mode="create" />} />
        <Route path="/recipes/:name" element={<RecipeDetail />} />
        <Route path="/recipes/:name/edit" element={<RecipeForm mode="edit" />} />
      </Route>
    </Routes>
  )
}
