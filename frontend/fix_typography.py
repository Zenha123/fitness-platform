import os
import re

def clean_classes(match):
    prefix = match.group(1)
    classes = match.group(2)
    suffix = match.group(3)
    
    # If font-display is in classes, we remove font-extrabold, font-bold, font-black
    if 'font-display' in classes:
        classes = re.sub(r'\bfont-(extrabold|bold|black)\b', '', classes)
        
    # If the tag is an h1-h6, we can also remove font-display, uppercase, tracking-wider, tracking-widest
    is_heading = re.search(r'<h[1-6]\b', match.string[max(0, match.start()-50):match.start()])
    
    if is_heading:
        classes = re.sub(r'\bfont-display\b', '', classes)
        classes = re.sub(r'\buppercase\b', '', classes)
        classes = re.sub(r'\btracking-(wider|widest)\b', '', classes)
        classes = re.sub(r'\bfont-(extrabold|bold|black)\b', '', classes)
        
    # clean up extra spaces
    classes = re.sub(r'\s+', ' ', classes).strip()
    
    return f'{prefix}{classes}{suffix}'

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Find all className="..." or className={'...'}
    new_content = re.sub(r'(className=["\'])(.*?)(["\'])', clean_classes, content)
    
    def clean_template(match):
        prefix = match.group(1)
        classes = match.group(2)
        suffix = match.group(3)
        
        is_heading = re.search(r'<h[1-6]\b', match.string[max(0, match.start()-50):match.start()])
        
        if 'font-display' in classes or is_heading:
            classes = re.sub(r'\bfont-(extrabold|bold|black)\b', '', classes)
        
        if is_heading:
            classes = re.sub(r'\bfont-display\b', '', classes)
            classes = re.sub(r'\buppercase\b', '', classes)
            classes = re.sub(r'\btracking-(wider|widest)\b', '', classes)
            
        classes = re.sub(r' {2,}', ' ', classes)
        return f'{prefix}{classes}{suffix}'
        
    new_content = re.sub(r'(className=\{`)(.*?)(`\})', clean_template, new_content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

if __name__ == "__main__":
    src_dir = r"c:\Users\Admin\Desktop\fitness-platform\frontend\src"
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith('.jsx'):
                process_file(os.path.join(root, file))
