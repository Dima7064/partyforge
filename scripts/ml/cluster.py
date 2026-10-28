import json
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

with open('scripts/ml/dataset.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

features = []
for c in data:
    features.append([
        c['level'], c['party_size'],
        c['tone_dark'], c['tone_heroic'], c['tone_political'],
        c['class_tank'], c['class_healer'], c['class_dps'], c['class_face'], c['class_control'], c['class_support'],
        c['loc_city'], c['loc_temple'], c['loc_forest'], c['loc_ruins'], c['loc_port'],
        c['rel_trust'], c['rel_debt'], c['rel_love'], c['rel_conflict'], c['rel_secret']
    ])

X = np.array(features)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

kmeans = KMeans(n_clusters=5, random_state=42, n_init=10)
kmeans.fit(X_scaled)

labels = kmeans.labels_.tolist()
centroids = scaler.inverse_transform(kmeans.cluster_centers_).tolist()

cluster_names = {
    0: "Сбалансированные приключения",
    1: "Тёмное фэнтези и интриги",
    2: "Эпическая героика",
    3: "Исследование мира",
    4: "Социальные конфликты"
}

output = {
    "centroids": centroids,
    "labels": labels,
    "cluster_names": cluster_names,
    "scaler_mean": scaler.mean_.tolist(),
    "scaler_scale": scaler.scale_.tolist()
}

with open('public/ml-clusters.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print("Модель обучена. Файл public/ml-clusters.json создан.")