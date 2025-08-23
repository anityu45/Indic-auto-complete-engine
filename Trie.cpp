// Trie implementation
#include<bits/stdc++.h>
using namespace std;

struct  Node
{
    Node*links[26];
    bool flag=false;

    bool containsKey(char ch){
        return links[ch-'a']!=NULL;
    }
    void add(char ch,Node* node){
        links[ch-'a']=node;
    }
    Node* get(char ch){
        return links[ch-'a'];
    }
    bool setEnd(){
        flag=true;
    }
    bool isEnd(){
        return flag;
    }
};

class Trie{
    private: 
        Node*root;

        void dfs(Node* node, string word, vector<string>& result){
            if (node->isEnd()) result.push_back(word);
            for (char ch = 'a'; ch <= 'z'; ch++) {
                if (node->containsKey(ch)){
                dfs(node->get(ch), word + ch, result);
                }
            }
        }

    public:

        Trie(){
            root=new Node();
        }
        
        void insert(string word){
            Node* node=root;
            for(int i=0;i<word.size();i++){
                if(!node->containsKey(word[i])){
                    node->add(word[i],new Node());
                }
                node=node->get(word[i]);
            }
            node->setEnd();
        }

        bool search(string word){
            Node*node=root;
            for(int i=0;i<word.size();i++){
                if(!node->containsKey(word[i])){
                    return false;
                }
                node=node->get(word[i]);
            }
            return node->isEnd();
        }

        bool startswith(string prefix){
            Node*node=root;
            for(int i=0;i<prefix.size();i++){
                if(!node->containsKey(prefix[i])){
                    return false;
                }
                node=node->get(prefix[i]);
            }
            return true;
        }

        vector<string> wordsWithPrefix(string prefix) {
            vector<string> result;
            if (!startswith(prefix)) return result;
            Node* node = root;
            for (char c : prefix){
                node = node->get(c);
            }
            dfs(node, prefix, result);
            return result;
        }

};
int main() {
    Trie trie;
    trie.insert("apple");
    trie.insert("app");
    trie.insert("apps");
    trie.insert("battle");
    trie.insert("bat");

    vector<string> words = trie.wordsWithPrefix("ap");
    for (string s : words) cout << s << endl;

    return 0;
}
