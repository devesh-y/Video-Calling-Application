export function setcookie(code:string,type:string){
    const d = new Date();
    d.setTime(d.getTime() + (24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = code + "=" + type + ";" + expires + ";path=/";
}
export function getCookieValue(cookieName: string): string | null {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.indexOf(cookieName + '=') === 0) {
            return cookie.substring(cookieName.length + 1);
        }
    }
    return null;
}