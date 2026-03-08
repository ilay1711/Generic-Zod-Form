import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/form')({
    component: FormPage,
})

function FormPage() {
    return <div></div>
}
