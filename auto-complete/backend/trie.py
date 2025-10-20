import unicodedata

class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_word = False
        self.frequency = 0

root = TrieNode()

def _normalize(s: str) -> str:
    return unicodedata.normalize('NFC', s.strip())

def insert(word: str, freq: int = 1):
    word = _normalize(word)
    if not word:
        return
    node = root
    for ch in word:
        if ch not in node.children:
            node.children[ch] = TrieNode()
        node = node.children[ch]
    node.is_word = True
    node.frequency += freq

def load_from_file(path: str):
    # Loading from file
    count = 0
    with open(path, 'r', encoding='utf-8') as f:
        for line in f:
            parts = line.strip().split()
            if not parts:
                continue
            word = parts[0]
            freq = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 1
            insert(word, freq)
            count += 1
    # Loaded words from file

def _find_node(prefix: str):
    node = root
    for ch in _normalize(prefix):
        if ch not in node.children:
            return None
        node = node.children[ch]
    return node

def starts_with(prefix: str, max_suggestions: int = 20):
    prefix = _normalize(prefix)
    node = _find_node(prefix)
    if node is None:
        return []

    suggestions = []
    queue = [(node, prefix)]

    while queue and len(suggestions) < 100:
        cur_node, cur_prefix = queue.pop(0)
        if cur_node.is_word:
            suggestions.append((cur_prefix, cur_node.frequency))
        for ch, child in cur_node.children.items():
            queue.append((child, cur_prefix + ch))

    suggestions.sort(key=lambda x: (-x[1], x[0]))
    return [s for s, _ in suggestions[:max_suggestions]]

def fuzzy_search(prefix: str, max_suggestions: int = 10):
    prefix = _normalize(prefix)
    results = set(starts_with(prefix, max_suggestions))
    letters = [chr(i) for i in range(0x0900, 0x097F)]

    # substitution
    for i in range(len(prefix)):
        for l in letters:
            w = prefix[:i] + l + prefix[i+1:]
            results.update(starts_with(w, max_suggestions))

    # insertion
    for i in range(len(prefix)+1):
        for l in letters:
            w = prefix[:i] + l + prefix[i:]
            results.update(starts_with(w, max_suggestions))

    # deletion
    for i in range(len(prefix)):
        w = prefix[:i] + prefix[i+1:]
        results.update(starts_with(w, max_suggestions))

    return list(results)[:max_suggestions]

def autocomplete(prefix: str, max_suggestions: int = 10):
    suggestions = starts_with(prefix, max_suggestions)
    if not suggestions:
        suggestions = fuzzy_search(prefix, max_suggestions)
    return suggestions
