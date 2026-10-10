<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the realtime chat browser-only against the configurable external Spring Boot backend, with STOMP and dynamically imported SockJS; this avoids SSR browser-global failures and preserves the external API contract.
- Hold room histories in React session state without persistent storage; each subscription captures its room so messages remain isolated when switching channels.
- Define the editorial light/dark semantic palette on the chat root and share typography through root head links; this keeps every chat surface and dialog theme-consistent.
- Map the SockJS global identifier to globalThis in Vite; its browser dependency otherwise throws before connecting.
